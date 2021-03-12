const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Token, sequelize, Sequelize: { Op } } = require('../config/database');
const HttpError = require('../helpers/http-error');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../helpers/jwt-helpers');

const registerUser = async (req, res, next) => {
    const newUserDraft = req.body;
    try {
        const emailTaken = await User.findOne({ 
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('email')),
                sequelize.fn('lower', newUserDraft.email)
            )
        })
        if (emailTaken) throw new HttpError('Account already exists', 400)
        const usernameTaken = await User.findOne({
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('username')),
                sequelize.fn('lower', newUserDraft.username)
            )
        })
        if (usernameTaken) throw new HttpError('This username is unavailable', 400);
    } catch (err) {
        return next(err);
    }
    
    try {
        const hash = await bcrypt.hash(newUserDraft.password, 10);
        newUserDraft.password = hash;
        const newUser = await User.create(newUserDraft);
        const accessToken = await createAccessToken(newUser.id);

        //puts a uuid 'key' claim on the refreshToken and saves that value in db instead of actual token
        const { refreshToken, key } = await createRefreshToken(newUser.id);
        await Token.create({ refreshKey: key, userId: newUser.id });

        res.status(201).json({ data:
            { 
                accessToken, 
                refreshToken,
                user: { 
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    username: newUser.username,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                    bio: newUser.bio
                }
            }
        });
    } catch(err) {
        console.log(err.message);
        next(new HttpError('Could not register account, try again later', 500));
    }
}

const loginUser = async (req, res, next) => {
    const { emailUsername, password } = req.body;
    try {
        const user = await User.findOne({ 
            where: { [Op.or]: [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    sequelize.fn('lower', emailUsername)
                ), 
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('email')),
                    sequelize.fn('lower', emailUsername)
                ) 
            ]}});
        if (!user) throw new Error('User does not exist')
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Password does not match'); 

        const accessToken = await createAccessToken(user.id);
        const { refreshToken, key } = await createRefreshToken(user.id);
        await Token.create({ refreshKey: key, userId: user.id });

        res.json({
            data: { 
                accessToken, 
                refreshToken,
                user: { 
                    id: user.id, 
                    username: user.username, 
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email,
                    profilePic: user.profilePic,
                    bio: user.bio
                }
            }
        })
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Invalid credentials or user does not exist', 401))
    }
}

const useRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) throw new Error('Not authorized', 401);
        const newAccessToken = await verifyRefreshToken(refreshToken, Token);
        res.json({ data: newAccessToken })
    } catch (err) {
        return next(err);
    }
}

const logoutUser = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) throw new HttpError('Bad request', 400);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) throw new HttpError('Forbidden', 403)
            const matchingToken = await Token.findOne({ where: { 
                userId: decoded.userId, 
                refreshKey: decoded.key 
            }});
            if (!matchingToken) throw new HttpError('Forbidden', 403)
            await matchingToken.destroy();
            res.sendStatus(204);
        })
    } catch (err) {
        return next(err);
    }
}

const logoutUserEverywhere = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) throw new HttpError('Bad request', 400);
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) throw new HttpError('Forbidden', 403)
            const deletedCount = await Token.destroy({ where: { 
                userId: decoded.userId 
            }});
            res.json({ data: deletedCount })
        })
    } catch (err) {
        return next(err);
    }
}

module.exports = { 
    registerUser, 
    loginUser, 
    useRefreshToken, 
    logoutUser, 
    logoutUserEverywhere 
}