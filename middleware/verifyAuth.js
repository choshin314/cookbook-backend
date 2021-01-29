const jwt = require('jsonwebtoken');
const HttpError = require('../helpers/http-error')

function verifyAuth(req, res, next) {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        if (!token) throw new HttpError('Not authorized to access this', 401);
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (err) {
        console.log('jwt auth error: ', err.message);
        return next(new HttpError('Not authorized to access this', 401))
    }
}

module.exports = verifyAuth;