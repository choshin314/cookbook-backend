const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/'})
const sequelize = require('../config/database');
const { User } = require('../models');

router.post('/', upload.single('profilePic'), async (req, res, next) => {
    console.log(req.body);
    console.log(req.file);
    res.status(200).json({ message: 'received'})
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