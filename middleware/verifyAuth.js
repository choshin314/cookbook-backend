const jwt = require('jsonwebtoken');

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
        return res.status(401).json({ message: 'Not authorized to access' });
    }
}

module.exports = verifyAuth;