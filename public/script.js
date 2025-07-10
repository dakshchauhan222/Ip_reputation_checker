
async function checkIP() {
  const ip = document.getElementById('ipInput').value.trim();
  const resultDiv = document.getElementById('resultContainer');
  const warningBanner = document.getElementById('warningBanner');

  warningBanner.style.display = 'none'; // Hide warning initially
  resultDiv.style.display = 'none';    // Hide results initially

  const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);

  const body = isIP ? { ip: ip } : { domain: ip };

  try {
    const response = await fetch('/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.error || 'Unknown error'}`);
      return;
    }

    const data = await response.json();

    // console.log("Data from backend: ", data);
    document.getElementById('ipAddress').textContent = data.ipAddress || 'N/A';
    document.getElementById('TotalReports').textContent = data.totalReports != 0 ? `${data.totalReports}` : 'N/A';
    document.getElementById('lastReportedAt').textContent = data.lastReportedAt != null ? `${data.lastReportedAt}`: 'N/A';
    document.getElementById('abuseScore').textContent = data.abuseConfidenceScore != null ? `${data.abuseConfidenceScore}%` : 'N/A';
    document.getElementById('countryCode').textContent = data.countryCode || 'N/A';
    document.getElementById('isp').textContent = data.isp || 'N/A';
    document.getElementById('DomainCreationTime').textContent = data.domainCreationDate  || 'N/A';
    document.getElementById('FrequencyScore').textContent=  data.frequencyScore !== undefined && data.frequencyScore !== null ? data.frequencyScore : 'N/A';
    document.getElementById('isWhiteList').textContent = data.isWhitelisted === false ? 'FALSE' : data.isWhitelisted === true? 'TRUE' : 'N/A';
    document.getElementById('isTor').textContent = data.isTor === true ? 'TRUE' : data.isTor === false ? 'FALSE' : 'N/A';
    document.getElementById('AbuseScore').textContent = data.Abusescore != null ? `${data.Abusescore}` : 'N/A';
    // Show warning if abuse score is high
    if (data.abuseConfidenceScore >= 75) {
      warningBanner.style.display = 'block';
    }

    resultDiv.style.display = 'block';

  } catch (err) {
    alert(`Something went wrong: ${err.message || JSON.stringify(err)}`);
  }
}

document.getElementById('checkButton').addEventListener('click', checkIP);
