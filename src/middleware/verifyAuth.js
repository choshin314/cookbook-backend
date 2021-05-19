const jwt = require('jsonwebtoken');
const HttpError = require('../helpers/http-error');

function verifyAuth(req, res, next) {
    try {
        const { authorization } = req.headers;
        if (!authorization) throw new HttpError('Not authorized', 401);
        const token = authorization.split(' ')[1];
        if (!token) throw new HttpError('Not authorized', 401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.message === 'jwt expired') {
                    throw new HttpError('token expired', 401)
                } else {
                    throw new HttpError('Not authorized', 401)
                }
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        console.log('jwt auth error: ', err.message);
        return next(err)
    }
}

module.exports = verifyAuth;