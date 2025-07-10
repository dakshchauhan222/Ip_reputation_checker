function AbuseIPDB(abuse){
    let abuseip= 0;
    if(abuse >=80 ){
        abuseip= 0.4
    }
    else if(abuse =>60 && abuse< 80){
        abuseip = 0.8
    }
    else if(abuse =>40 && abuse< 60){
        abuseip = 1.2
    }
    else if(abuse =>20 && abuse< 40){
        abuseip = 1.6
    }
    else{
        abuseip = 2;
    }
    return abuseip;
}

module.exports= {AbuseIPDB};