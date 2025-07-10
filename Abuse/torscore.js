function torscore(istor){
    if(istor == null){
        return 1;
    }
    if(istor==true){
        return 0;
    }
    else{
        return 1;
    }
}
module.exports = {torscore};