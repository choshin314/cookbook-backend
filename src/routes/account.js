const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});

const verifyAuth = require('../middleware/verifyAuth');
const { 
    updateAcctGeneralInfo, 
    updateAcctPassword,
    updateProfilePic
} = require('../controllers/accountController');

router.use(verifyAuth)

router.patch('/general', updateAcctGeneralInfo)

router.patch('/password', updateAcctPassword)

router.patch('/profile-pic', upload.single('profilePic'), updateProfilePic)

module.exports = router;