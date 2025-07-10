function formatDate(isoDateStr) {
  if (!isoDateStr || isoDateStr === 'Not Available') return isoDateStr;

  const date = new Date(isoDateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' }; // e.g., September 15, 1997
  return date.toLocaleDateString('en-US', options);
}

module.exports = {formatDate}