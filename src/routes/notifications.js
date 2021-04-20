const express = require('express');
const router = express.Router();

const verifyAuth = require('../middleware/verifyAuth');
const { getNotifications, checkNotifications } = require('../controllers/notificationsController');

router.use(verifyAuth);

router.get('/', getNotifications)

router.patch('/', checkNotifications)

module.exports = router;