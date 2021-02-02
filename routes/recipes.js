const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const {convertToSlug} = require('../helpers');
const db = require('../config/database')
const { User, Tag, Ingredient, Recipe, Instruction, Follow, sequelize, Sequelize: {Op} } = db;
const verifyAuth = require('../middleware/verifyAuth');
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const uploadPic = require('../helpers/file-uploads');
const HttpError = require('../helpers/http-error')

router.get('/', async (req, res) => {
    const { search, sort } = req.query;
    //if search, get all recipes where title or tags include search query
    //if sort, sort by sort DESC
    //default is return all recipes sorted by likes

    res.send(`Retrieving`)
})

router.get('/feed/private', verifyAuth, async (req, res, next) => {
    const lastFetched = new Date(req.query.lastFetched)
    const user = await User.findOne({ 
        include: [ { model: User, as: 'following', attributes: ['id'] }]
    })
    console.log(user)
    const recipes = await Recipe.findAll({ 
        where: { updated_at: { [Op.gt]: lastFetched }}
    })
    res.json(recipes)
})

router.get('/feed/public', async (req, res, next) => {
    const offset = req.query.offset || 0;
    try {
        const recipes = await sequelize.query(`
            SELECT 
                recipes.*, 
                count(likes.*) "likeCount", 
                users.username, users.profile_pic, users.first_name, users.last_name,
                count(reviews.*) "reviewCount",
                avg(reviews.rating) "avgRating"
            FROM recipes 
            LEFT JOIN likes ON recipes.id = likes.recipe_id
            LEFT JOIN reviews ON recipes.id = reviews.recipe_id
            LEFT JOIN users ON recipes.user_id = users.id   
            GROUP BY recipes.id, users.username, users.profile_pic, users.first_name, users.last_name 
            ORDER BY "likeCount", recipes.created_at, recipes.title
            LIMIT 5 OFFSET ${offset}
        `);
        const formattedRecipes = recipes[0].map(r => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            coverImg: r.cover_img,
            intro: r.intro,
            servings: r.servings,
            prepTime: r.prep_time,
            cookTime: r.cook_time,
            likeCount: r.likeCount,
            reviewCount: r.reviewCount,
            avgRating: r.avgRating,
            user: {
                userId: r.user_id,
                username: r.username,
                profilePic: r.profile_pic,
                firstName: r.first_name,
                lastName: r.last_name
            }
        }))
        res.json(formattedRecipes)
    } catch (err) {
        return next(new HttpError('Could not retrieve recipes', 500))
    }
})


//----------GET RECIPE BY ID--------------//
router.get('/:recipeId', async (req, res, next) => {
    Recipe.findByPk(req.params.recipeId, { include: [{model: User, attributes: ['username']}]})
        .then(recipe => {
            if (!recipe) throw new Error('Recipe was not found')
            res.json(recipe)
        })
        .catch(err => next(new HttpError(err.message, 404)))
})


//-----------GET RECIPE BY USER------------//
router.get('/user/:username', async (req, res, next) => {
    const username = req.params.username; 
    if (!username) return next(new HttpError('Bad request, need more info', 400));
    try {
        const user = await User.findOne({
            attributes: ['id'],
            include: [{ model: Recipe, as: 'userRecipes', include: [
                { model: User, attributes: ['id', 'profilePic', 'username', 'firstName', 'lastName'] }
            ]}],
            where: { username: username }
        });
        res.status(200).json(user.userRecipes)
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Could not retrieve recipes', 400))
    }
})

router.get('/bookmarks/:username', async (req, res, next) => {
    const username = req.params.username; 
    if (!username) return next(new HttpError('Bad request, need more info', 400));
    try {
        const user = await User.findOne({
            attributes: ['id'],
            include: [{ model: Recipe, as: 'bookmarkedRecipes', include: [
                { model: User, attributes: ['id', 'profilePic', 'username', 'firstName', 'lastName'] }
            ]}],
            where: { username: username }
        })
        res.status(200).json(user.bookmarkedRecipes);
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Could not retrieve recipes', 400))
    }
})

//-------------------CREATE RECIPE --------------------//
router.use(verifyAuth);
router.post('/', fileUpload({useTempFiles: true}), async (req, res, next) => {
    if (!req.user.userId) return next(new HttpError('Not authorized', 401));
    let body = JSON.parse(req.body.formJSON);
    let { cookTime, prepTime, servings, instructions, tags, ingredients } = req.body;
    cookTime = parseInt(cookTime);
    prepTime = parseInt(prepTime);
    servings = parseInt(servings);
    instructions = JSON.parse(instructions);
    tags = JSON.parse(tags);
    ingredients = JSON.parse(ingredients);
    try {
        let coverImg = await uploadPic(req.files.coverImg.tempFilePath);
        const recipe = await Recipe.create({
            title: req.body.title,
            intro: req.body.introText,
            slug: convertToSlug(req.body.title),
            coverImg,
            servings,
            prepTime,
            cookTime,
            tags: tags.map(tag => ({ content: tag.content })),
            instructions: instructions.map((ins, i) => ({ content: ins.content, position: i })),
            ingredients: ingredients.map((ing, i) => ({ content: ing.content, qty: ing.qty, unit: ing.unit, position: i })),
            user_id: req.user.userId,
        }, { include: [ {model: Tag, as: 'tags'}, {model: Ingredient, as: "ingredients"}, {model: Instruction, as: "instructions"} ]})
        res.status(201).json(recipe)
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not create recipe. Please try again later', 400))
    }
})

module.exports = router;