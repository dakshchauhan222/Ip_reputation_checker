function lastreport(lastReportedAt) {
    if(lastReportedAt == null){
        return 2;
    }
    const now = new Date();
    const lastReportDate = lastReportedAt ? new Date(lastReportedAt) : null;

    if (!lastReportDate) return 0.2;

    const diffTime = Math.abs(now - lastReportDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);


    let recencyScore = 0;
    if (diffDays <= 7) {
        recencyScore = 2;
    } 
    else if (diffDays >= 15 && diffDays < 30) {
        recencyScore = 1.5;
    } 
    else if(diffDays >= 30 && diffDays < 60){
        recencyScore = 1.0;
    }
    else if(diffDays >= 60 && diffDays < 90){
        recencyScore = 0.5
    }
    else{
        recencyScore = 0.2
    }

    return recencyScore;
}

module.exports = { lastreport };