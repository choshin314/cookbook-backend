const HttpError = require('../helpers/http-error');

module.exports = function(err, req, res, next) {
    console.log(err.message);
    HttpError.handleError(err, res);
}
