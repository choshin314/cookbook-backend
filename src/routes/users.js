const express = require('express');
const router = express.Router();

const { 
    getUserByUsernameOrId, 
    getUserStats, 
    getGivenUsersFollowers, 
    getGivenUsersFollowing, 
    getUserSearchResults 
} = require('../controllers/usersController');

router.get('/', getUserSearchResults)

router.get('/:usernameOrId', getUserByUsernameOrId)

router.get('/:usernameOrId/stats', getUserStats)

router.get('/:username/followers', getGivenUsersFollowers)

router.get('/:username/following', getGivenUsersFollowing)

module.exports = router;