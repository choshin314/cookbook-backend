const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { User } = require('../models');
const HttpError = require('../helpers/http-error');
const uploadPic = require('../helpers/file-uploads');


router.post('/', upload.single('profilePic'), async (req, res, next) => {
    let { firstName, lastName, email, username, password, bio } = req.body;
    let profilePic = await uploadPic(req.file.path, next);
    password = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({ 
            firstName, lastName, email, username, password, bio, profilePic 
        });
        res.status(200).json(newUser);
    } catch(err) {
        console.log(err.message);
        next(new HttpError('Could not register account, try again later', 500));
    }
})

router.get('/', async (req, res) => {
    const queried = req.query.name;
    if (!queried) return res.status(400).send('need search query')
    res.send(`searched for ${queried}`)
})

router.get('/:userId/stats', async (req, res, next) => {
    const userId = req.params.userId;
    //get user follower count, following count, recipe count

    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

module.exports = router;