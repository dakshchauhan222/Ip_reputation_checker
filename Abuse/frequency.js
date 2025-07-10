function getFrequencyScore(totalReports, lastReportedAt) {
  if (!totalReports || totalReports === 0) return 0;

  if (!lastReportedAt || lastReportedAt === '0') {
    // No valid date for last report, assume no recent abuse
    return 0;
  }
  // Calculate how recent the last report is (in days)
  const now = new Date();
  const lastReportDate = lastReportedAt ? new Date(lastReportedAt) : null;

  // If no lastReportedAt date, treat it as old report
  if (!lastReportDate) return 0.2; // some small score because reports exist but no recent info

  const diffTime = Math.abs(now - lastReportDate);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // The fresher the report, the higher the score (max 1)
  // If last report is within 7 days, max score
  // If last report older than 90 days, score tends to 0
  let recencyScore = 0;
  if (diffDays <= 7) {
    recencyScore = 1;
  } else if (diffDays >= 90) {
    recencyScore = 0;
  } else {
    recencyScore = 1 - (diffDays - 7) / (90 - 7);
  }

  // Scale totalReports to a max cap to normalize score
  // e.g. if reports > 100, consider max frequency
  const cappedReports = Math.min(totalReports, 100);
  const reportsScore = cappedReports / 100; // between 0 and 1

  // Combine both: frequency score = weighted average
  // You can adjust weights as you want
  const frequencyScore = (0.7 * reportsScore) + (0.3 * recencyScore);

  // Clamp final score between 0 and 1
  return Math.min(Math.max(frequencyScore, 0), 1);
}

module.exports = {getFrequencyScore};
