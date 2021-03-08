const express = require('express')
const router = express.Router();

const verifyAuth = require('../middleware/verifyAuth')
const { 
    getMainUserBookmarkedRecipeIds, 
    bookmarkRecipeById, 
    unbookmarkRecipeById, 
    getMainUserFollowerIds,
    getMainUserFollowingIds,
    followUserById,
    unfollowUserById,
    getMainUserLikedRecipeIds,
    likeRecipeById,
    unlikeRecipeById
} = require('../controllers/socialController');

router.use(verifyAuth)

//---Bookmarks---//
router.get('/bookmarks', getMainUserBookmarkedRecipeIds)

router.post('/bookmarks', bookmarkRecipeById)

router.delete('/bookmarks/:recipeId', unbookmarkRecipeById)

//---Followers/Following---//
router.get('/followers', getMainUserFollowerIds)

router.get('/following', getMainUserFollowingIds)

router.post('/following', followUserById)

router.delete('/following/:followeeId', unfollowUserById)

//---Likes---//
router.get('/likes', getMainUserLikedRecipeIds)

router.post('/likes', likeRecipeById)

router.delete('/likes/:recipeId', unlikeRecipeById)

module.exports = router;