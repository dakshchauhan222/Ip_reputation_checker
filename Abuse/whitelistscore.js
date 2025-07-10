function whitelist(isWhitelisted){
    let white
    if(isWhitelisted == null){
        return 1;
    }
    if (isWhitelisted == true) {
        white = 1;
    }
    else {
        white = 0;
    }
    return white;
}
module.exports = {whitelist};