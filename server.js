// Imports
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
//const fetch = require('node-fetch');
const fetch = require('fetch');
const cors = require('cors');
const dns = require('dns').promises;
const { getFrequencyScore } = require('./Abuse/frequency');
const { formatDate } = require('./Abuse/creationdate');
const {calculateAbuseScore } = require('./Abuse/calculatescore');
const { domainCreationDate} = require('./Abuse/creationtimescore');
// Initialize
const app = express();
//const PORT = 3000;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


// AbuseIPDB API key (ensure you keep it safe)
const API_KEY = process.env.API_KEY;
const NINJA_API_KEY = process.env.NINJA_API_KEY;
// IPv4 validation regex
function isValidIPv4(ip) {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}
app.use(express.static('public'));
// POST /check route
app.post('/check', async (req, res) => {
  console.log('Request body:', req.body);

  let { ip, domain } = req.body;
  let hostname = '';
  let domainCreationDate = 'Not Available';
  // If domain provided, resolve to IP
  if (domain) {

    try {
      // Remove http:// or https:// if present
      domain = domain.replace(/^https?:\/\//, '');

      // Construct URL with http:// to parse hostname properly
      const urlObj = new URL('http://' + domain);
      hostname = urlObj.hostname;
      console.log('Parsed hostname:', hostname);
    } catch (e) {
      console.log('Invalid domain format:', domain, e);
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    try {
      const result = await dns.lookup(hostname, { family: 4 });
      ip = result.address;
      console.log(`Resolved domain (${hostname}) to IP: ${ip}`);

      if (!isValidIPv4(ip)) {
        return res.status(400).json({ error: 'Resolved IP is not a valid IPv4 address' });
      }

      if (hostname) {
        try {
          const whoisNinjaResponse = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${hostname}`, {
            headers: { 'X-Api-Key': NINJA_API_KEY }
          });
          console.log('API-Ninjas WHOIS response:', whoisNinjaResponse.data);

          // Extract and convert creation_date
          const creationDates = whoisNinjaResponse.data.creation_date;
          if (Array.isArray(creationDates) && creationDates.length > 0) {
            const earliestTimestamp = Math.min(...creationDates);
            domainCreationDate = new Date(earliestTimestamp * 1000).toISOString();
          } else {
            domainCreationDate = 'Not Available';
          }
        } catch (error) {
          console.error('Error fetching domain creation date from API-Ninjas:', error.message);
        }
      }
    } catch (dnsError) {
      console.log('DNS lookup failed:', dnsError.message);
      return res.status(400).json({ error: 'Invalid domain name or DNS lookup failed' });
    }



  }

  // Validate IP before proceeding
  if (!ip || !isValidIPv4(ip)) {
    console.log('No valid IPv4 provided');
    return res.status(400).json({ error: 'Valid IPv4 address or domain name is required' });
  }

  console.log('Final IP to check:', ip);


  // Query AbuseIPDB API
  try {
    console.log(`Calling AbuseIPDB API with IP: ${ip}`);
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log('AbuseIPDB response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('AbuseIPDB API error response:', errorData);
      return res.status(response.status).json({ error: errorData.errors?.[0]?.detail || 'API error' });
    }

    //printing the data of the domain or IP
    const data = await response.json();
    console.log('AbuseIPDB API response data:', data);


    //log report details
    console.log('total reports :', data.data.totalReports);
    console.log('lastReportedAt :', data.data.lastReportedAt);

    // If domainCreationDate hasn't been set already AND domain info exists in AbuseIPDB data
    //this wont work if the domains is .net or anything else than .com
    if (domainCreationDate === 'Not Available' && data.data.domain) {
      try {
        const abuseDomain = data.data.domain;
        console.log('Trying WHOIS for domain from AbuseIPDB:', abuseDomain);

        const whoisNinjaResponse = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${abuseDomain}`, {
          headers: { 'X-Api-Key': NINJA_API_KEY }
        });

        console.log('WHOIS from AbuseIPDB domain response:', whoisNinjaResponse.data);
        // Extract and convert creation_date from AbuseIPDB domain whois
        const creationDates = whoisNinjaResponse.data.creation_date;
        if (Array.isArray(creationDates) && creationDates.length > 0) {
          const earliestTimestamp = Math.min(...creationDates);
          domainCreationDate = new Date(earliestTimestamp * 1000).toISOString();
        } else {
          domainCreationDate = 'Not Available';
        }
      } catch (error) {
        if (error.response) {
          console.error('WHOIS API error status:', error.response.status);
          console.error('WHOIS API error data:', error.response.data);
        } else {
          console.error('Error fetching WHOIS from AbuseIPDB domain:', error.message);
        }
      }
    }

    //formatting the date into readable form
    const formattedCreationDate = formatDate(domainCreationDate);

    //Calculate the frequency of reports
    const frequencyScore = getFrequencyScore(data.data.totalReports, data.data.lastReportedAt);

    //log creation date
    console.log('domain creation time:', formattedCreationDate);
    console.log('Frequency Score being sent:', frequencyScore);

    //Calculating the abuse score
    const Abusescore = calculateAbuseScore(data.data.totalReports,data.data.lastReportedAt,data.data.isWhitelisted,data.data.abuseConfidenceScore,frequencyScore,data.data.isTor,domainCreationDate);
    console.log('abusescore : ', Abusescore);

    // Send final JSON response
    res.json({
      ipAddress: data.data.ipAddress,
      totalReports: data.data.totalReports,
      abuseConfidenceScore: data.data.abuseConfidenceScore,
      countryCode: data.data.countryCode,
      lastReportedAt: data.data.lastReportedAt,
      isp: data.data.isp,
      domainCreationDate: formattedCreationDate,
      frequencyScore: (frequencyScore * 100).toFixed(2),
      isWhitelisted: data.data.isWhitelisted,
      isTor: data.data.isTor,
      Abusescore: Abusescore
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
//const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

