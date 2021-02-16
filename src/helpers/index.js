function convertToSlug(str) {
    return str.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +|_/g,'-');
}

module.exports = { convertToSlug }