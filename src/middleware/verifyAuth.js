const jwt = require('jsonwebtoken');
const HttpError = require('../helpers/http-error');

function verifyAuth(req, res, next) {
    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1];
        if (!token) throw new HttpError('No token', 401);
        req.token = token;
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (err) {
        console.log('jwt auth error: ', err.message);
        next(new HttpError('Not authorized', 401))
    }
}

module.exports = verifyAuth;