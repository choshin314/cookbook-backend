const express = require('express');
const router = express.Router();

const { 
    getUserByUsername, 
    getUserStats, 
    getGivenUsersFollowers, 
    getGivenUsersFollowing, 
    getUserSearchResults 
} = require('../controllers/usersController');

router.get('/', getUserSearchResults)

router.get('/:username', getUserByUsername)

router.get('/:username/stats', getUserStats)

router.get('/:username/followers', getGivenUsersFollowers)

router.get('/:username/following', getGivenUsersFollowing)

module.exports = router;