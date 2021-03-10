const express = require('express');
const router = express.Router();

const verifyAuth = require('../middleware/verifyAuth');
const { 
    loginUser, 
    registerUser,
    useRefreshToken,
    logoutUser,
    logoutUserEverywhere 
} = require('../controllers/authController');

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post('/refresh', useRefreshToken)

router.delete('/logout/single-location', logoutUser)

router.delete('/logout/all-locations', logoutUserEverywhere)

module.exports = router;