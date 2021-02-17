const express = require('express');
const router = express.Router();
const db = require('../config/database')
const { 
    User, 
    Review, 
    Recipe, 
    rawConfig, sequelize, Sequelize: {Op} 
} = db;
const verifyAuth = require('../middleware/verifyAuth');
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const validatePic = require('../middleware/validateImg');
const { uploadPic, deletePic } = require('../helpers/file-uploads');
const HttpError = require('../helpers/http-error')


router.use(verifyAuth);
router.post('/', upload.single('reviewImg'), async (req, res, next) => {
    const { userId: user_id } = req.user;
    try {
        //client sends all non-file fields in one stringified form field called 'formJSON'
        const { headline, recipeId: recipe_id, content, rating } = JSON.parse(req.body.formJSON);
        const reviewExists = await Review.findOne({ where: { user_id, recipe_id }});
        if (reviewExists) throw new HttpError('Review already exists', 400);
        const reviewImg = req.file ? await uploadPic(req.file.path) : null;
        const newReview = { reviewImg, headline, rating, content, recipe_id, user_id };
        await Review.create(newReview);
        const updates = await Recipe.findByPk(recipe_id, {
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
                [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating']
            ],
            include: [{ model: Review, as: 'reviews', include: [
                { model: User, as: 'user', attributes: ['username', 'profilePic']}
            ]}],
            order: [[{ model: Review, as: 'reviews' }, 'created_at','DESC']],
            group: ['Recipe.id', 'reviews.id', 'reviews->user.id']
        })
        res.json({ data: updates }); //sends back { data: { reviews: [...] }} 
    } catch (err) {
        console.log(err)
        if (err.code) return next(err); 
        return next(new HttpError('Could not create review', 500));
    }
})

module.exports = router;

// Recipe.findByPk(req.params.recipeId, { 
//     attributes: [
//         'id','title','slug','coverImg','intro','servings','prepTime','cookTime',
//         [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
//         [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating'],
//         [sequelize.fn('COUNT', sequelize.col('likedBy.username')), 'likeCount']
//     ],
//     include: [
//         { model: User, as: 'user', attributes: ['id', 'username', 'profilePic', 'firstName', 'lastName']},
//         { model: User, as: 'likedBy' },
//         { model: Review, as: 'reviews', include: [
//             { model: User, as: 'user', attributes: ['username', 'profilePic']}
//         ]},
//         { model: Ingredient, as: 'ingredients' },
//         { model: Instruction, as: 'instructions' },
//         { model: Tag, as: 'tags' }
//     ],
//     order: [
//         [{ model: Ingredient, as: 'ingredients' }, 'position','ASC'], 
//         [{ model: Instruction, as: 'instructions' }, 'position','ASC']
//     ],
//     group: [
//         'Recipe.id', 
//         'reviews.id', 
//         'user.id', 
//         'likedBy.id', 
//         "likedBy->Like.recipe_id", 
//         "likedBy->Like.user_id",
//         'ingredients.id',
//         'instructions.id',
//         'tags.id',
//         'reviews->user.id'
//     ]
// })