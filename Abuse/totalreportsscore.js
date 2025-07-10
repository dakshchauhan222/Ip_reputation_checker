function Scorereport(totalReports){
    let reportsScore;
     if(totalReports >= 0 && totalReports <=5){
        reportsScore=2;
    }
    else if(totalReports>6 && totalReports <= 30){
        reportsScore=1.6
    }
    else if(totalReports>30 && totalReports <= 70){
         reportsScore=1.2
    }
    else if(totalReports>70 && totalReports <= 100){
        reportsScore=0.8
    }
    else{
        reportsScore=0.4
    }

    return reportsScore;
}

module.exports = {Scorereport};