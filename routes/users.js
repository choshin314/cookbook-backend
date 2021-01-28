const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { User } = require('../models');
const HttpError = require('../helpers/http-error')

router.post('/', upload.single('profilePic'), async (req, res, next) => {
    let profilePic;
    let { firstName, lastName, email, username, password, bio } = req.body;
    try {
        await cloudinary.uploader.upload(req.file.path, {}, (err, result) => {
            console.log(result);
            if(result) profilePic = result.secure_url;
        });
    } catch (err) {
        const error = new HttpError('Problem uploading profile pic, please try again later', 500);
        return next(error);
    }
    password = await bcrypt.hash(password, 10);
    let newUser;
    try {
        newUser = await User.create({ 
            firstName, lastName, email, username, password, bio, profilePic 
        })
    } catch(err) {
        console.log(err.message);
        next(new HttpError('Could not register account, try again later', 500));
    }
    res.status(200).json(newUser)
})

router.get('/', async (req, res) => {
    const queried = req.query.name;
    if (!queried) return res.status(400).send('need search query')
    res.send(`searched for ${queried}`)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

module.exports = router;