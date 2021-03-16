const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/'});

const verifyAuth = require('../middleware/verifyAuth');
const { 
    getRecipeById, 
    getUserProfileRecipes, 
    getUserProfileBookmarks, 
    getRecipeSearchResults, 
    getRecipesForPublicFeed, 
    getRecipesForPrivateFeed, 
    createRecipe, 
    updateRecipeGeneralInfo, 
    updateRecipePic, 
    updateRecipeTags, 
    updateRecipeIngredients, 
    updateRecipeInstructions, 
    deleteRecipe 
} = require('../controllers/recipesController');

router.get('/:recipeId', getRecipeById)
router.get('/user/:username', getUserProfileRecipes)
router.get('/bookmarks/:username', getUserProfileBookmarks)
router.get('/', getRecipeSearchResults)
router.get('/feed/public', getRecipesForPublicFeed)

//--------------------PROTECTED ROUTES--------------------//
router.use(verifyAuth);

router.get('/feed/private', getRecipesForPrivateFeed)

router.post('/', upload.single('coverImg'), createRecipe)
router.patch('/:recipeId/general', updateRecipeGeneralInfo)
router.patch('/:recipeId/cover-img', upload.single('coverImg'), updateRecipePic)
router.patch('/:recipeId/tags', updateRecipeTags)
router.patch('/:recipeId/ingredients', updateRecipeIngredients)
router.patch('/:recipeId/instructions', updateRecipeInstructions)
router.delete('/:recipeId', deleteRecipe)

module.exports = router;