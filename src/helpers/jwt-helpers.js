const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const HttpError = require('./http-error');

const ACCESS_EXP = '30m';
const REFRESH_EXP = '1y';
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function createAccessToken(userId) {
    return await jwt.sign({ userId }, ACCESS_SECRET, {expiresIn: ACCESS_EXP});
}

async function createRefreshToken(userId) {
    const key = uuidv4();
    const refreshToken = await jwt.sign({ userId, key }, REFRESH_SECRET, {expiresIn: REFRESH_EXP});
    return { refreshToken, key }
}

async function verifyRefreshToken(refreshToken, model) {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const matchingToken = await model.findOne({ where: {
            refreshKey: decoded.key,
            userId: decoded.userId
        }})
        if (!matchingToken) throw new Error();
        return await createAccessToken(decoded.userId);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            const { key: expKey, userId: expUserId } = jwt.decode(refreshToken);
            await model.destroy({ where: {
                refreshKey: expKey, userId: expUserId
            }})
        }
        throw new HttpError('Not authorized', 401)
    }
}

module.exports = { createAccessToken, createRefreshToken, verifyRefreshToken };