const jwt = require('jsonwebtoken');

const ACCESS_EXP = 3600;
const REFRESH_EXP = 3600 * 24 *365;
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function createAccessToken(userId) {
    return await jwt.sign({ userId }, ACCESS_SECRET, {expiresIn: ACCESS_EXP});
}

async function createRefreshToken(userId) {
    return await jwt.sign({ userId }, REFRESH_SECRET, {expiresIn: REFRESH_EXP});
}

module.exports = { createAccessToken, createRefreshToken };