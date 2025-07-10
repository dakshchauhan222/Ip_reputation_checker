function domainCreationScore(domainCreationDate) {
    const now = new Date();
    const creationDate = domainCreationDate ? new Date(domainCreationDate) : null;

    if (!creationDate || isNaN(creationDate)) return 0.2;

    const diffTime = Math.abs(now - creationDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    let score = 0;

    if (diffDays >= 730) { // > 2 years
        score = 1.0;
    } else if (diffDays >= 365) { // 1 - 2 years
        score = 0.8;
    } else if (diffDays >= 180) { // 6 months – 1 year
        score = 0.6;
    } else if (diffDays >= 90) { // 3–6 months
        score = 0.4;
    } else {
        score = 0.2; // < 3 months
    }

    return score;
}

module.exports = { domainCreationScore };
