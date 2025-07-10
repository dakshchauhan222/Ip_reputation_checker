const { AbuseIPDB } = require('./abuseConfidencescore');
const { domainCreationScore } = require('./creationtimescore');
const { lastreport } = require('./lastreportedscore');
const { torscore } = require('./torscore');
const { Scorereport } = require('./totalreportsscore');
const {whitelist}= require('./whitelistscore');

function calculateAbuseScore(totalReports, lastReportedAt, isWhitelisted, abuseConfidenceScore, frequency,istor,domainCreationDate) {
    //total reports score
    const reportsScore = Scorereport(totalReports);
    //last report score
    const recencyScore= lastreport(lastReportedAt);
    //whitelistscore
    const white= whitelist(isWhitelisted);
    //abuse confidence score
    const abuse = AbuseIPDB(abuseConfidenceScore)
    //torscore
    const torsc= torscore(istor);
    //domain creation score
    const CreationScore = domainCreationScore(domainCreationDate);
    const score = recencyScore + reportsScore + white + abuse + (1-frequency) + torsc + CreationScore;
    return score;
}

module.exports = { calculateAbuseScore };