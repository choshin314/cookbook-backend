const express = require('express');
const router = express.Router();
const {convertToSlug} = require('../helpers');
const db = require('../config/database')
const { 
    User, 
    Review, 
    Bookmark,
    Tag, 
    Ingredient, 
    Recipe, 
    Instruction, 
    Follow, 
    rawConfig, sequelize, Sequelize: {Op} 
} = db;
const verifyAuth = require('../middleware/verifyAuth');
const validateImg = require('../middleware/validateImg');
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const { uploadPic, deletePic } = require('../helpers/file-uploads');
const { updateById, updateRecipeList } = require('../helpers/query-helpers');
const HttpError = require('../helpers/http-error')

router.get('/', async (req, res) => {
    const { search, sort } = req.query;
    //if search, get all recipes where title or tags include search query
    //if sort, sort by sort DESC
    //default is return all recipes sorted by likes

    res.send(`Retrieving`)
})

router.get('/feed/private', verifyAuth, async (req, res, next) => {
    const lastFetched = new Date() - 1209600000
    const user = await User.findOne({ 
        include: [ { 
            model: User, 
            as: 'following', 
            attributes: ['id'],
            include: [ {
                model: Recipe,
                as: 'userRecipes'
            } ] 
        }]
    })

    console.log(user);
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
        res.json({ data: formattedRecipes })
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Could not retrieve recipes', 500))
    }
})


//----------GET RECIPE BY ID--------------//
router.get('/:recipeId', async (req, res, next) => {
    Recipe.findByPk(req.params.recipeId, { 
        attributes: [
            'id','title','slug','coverImg','intro','servings','prepTime','cookTime',
            [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
            [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('likedBy.username')), 'likeCount']
        ],
        include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'profilePic', 'firstName', 'lastName']},
            { model: User, as: 'likedBy' },
            { 
                model: Review, 
                as: 'reviews', 
                attributes: ['content', 'updated_at', 'headline', 'id', 'rating', 'recipeId', 'reviewImg'], 
                include: [{ model: User, as: 'user', attributes: ['username', 'profilePic']}]
            },
            { model: Ingredient, as: 'ingredients' },
            { model: Instruction, as: 'instructions' },
            { model: Tag, as: 'tags' }
        ],
        order: [
            [{ model: Ingredient, as: 'ingredients' }, 'position','ASC'], 
            [{ model: Instruction, as: 'instructions' }, 'position','ASC']
        ],
        group: [
            'Recipe.id', 
            'reviews.id', 
            'user.id', 
            'likedBy.id', 
            "likedBy->Like.recipe_id", 
            "likedBy->Like.user_id",
            'ingredients.id',
            'instructions.id',
            'tags.id',
            'reviews->user.id'
        ]
    })
        .then(recipe => {
            // recipe.dataValues.user = recipe.dataValues.User;
            // delete recipe.dataValues.User;
            if (!recipe) throw new Error('Recipe was not found')
            res.json({ data: recipe })
        })
        .catch(err => next(new HttpError(err.message, 404)))
})


//-----------GET RECIPE BY USER------------//
router.get('/user/:username', async (req, res, next) => {
    const username = req.params.username; 
    if (!username) return next(new HttpError('Bad request', 400));
    try {
        const {id} = await User.findOne({ attributes: ['id'], where: { username: username } });
        const recipes = await sequelize.query(`
            SELECT 
                recipes.*, 
                count(reviews.*) "reviewCount", 
                avg(reviews.rating) "avgRating", 
                count(likes.*) "likeCount" ,
                users.id "user.id", 
                users.username "user.username", 
                users.profile_pic "user.profilePic", 
                users.first_name "user.firstName", 
                users.last_name "user.lastName"
            FROM recipes
            INNER JOIN users ON recipes.user_id = users.id
            LEFT JOIN reviews ON recipes.id = reviews.recipe_id
            LEFT JOIN likes ON recipes.id = likes.recipe_id
            WHERE recipes.user_id = '${id}'
            GROUP BY recipes.id, users.id         
        `, rawConfig(Recipe))
        res.status(200).json({ data: recipes })
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Could not retrieve recipes', 500))
    }
})

router.get('/bookmarks/:username', async (req, res, next) => {
    const username = req.params.username; 
    if (!username) return next(new HttpError('Bad request, need more info', 400));
    try {
        const {id} = await User.findOne({ attributes: ['id'], where: { username: username } });
        const bookmarks = await sequelize.query(`
            SELECT
                bookmarks.recipe_id,    
                recipes.*,
                count(reviews.*) "reviewCount",
                avg(reviews.rating) "avgRating",
                count(likes.*) "likeCount",
                users.id "user.id",
                users.username "user.username", 
                users.profile_pic "user.profilePic", 
                users.first_name "user.firstName", 
                users.last_name "user.lastName"
            FROM bookmarks 
            INNER JOIN recipes ON bookmarks.recipe_id = recipes.id 
            INNER JOIN users ON recipes.user_id = users.id 
            LEFT JOIN reviews ON bookmarks.recipe_id = reviews.recipe_id 
            LEFT JOIN likes ON bookmarks.recipe_id = likes.recipe_id  
            WHERE bookmarks.user_id = '${id}' 
            GROUP BY recipes.id, users.id, bookmarks.recipe_id
        `, rawConfig(Recipe))
        res.status(200).json({ data: bookmarks });
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Could not retrieve recipes', 400))
    }
})

//-------------------CREATE RECIPE --------------------//
router.use(verifyAuth);
router.post('/', upload.single('coverImg'), async (req, res, next) => {
    // if (!req.user.userId) return next(new HttpError('Not authorized', 401));
    let { 
        title, intro, cookTime, prepTime, servings, instructions, tags, ingredients 
    } = JSON.parse(req.body.formJSON);
    try {
        let coverImg = await uploadPic(req.file.path);
        const recipe = await Recipe.create({
            title,
            intro,
            slug: convertToSlug(title),
            coverImg,
            servings,
            prepTime,
            cookTime,
            tags: tags.map(tag => ({ content: tag.content })),
            instructions: instructions.map((ins, i) => ({ content: ins.content, position: i })),
            ingredients: ingredients.map((ing, i) => ({ content: ing.content, qty: ing.qty, unit: ing.unit, position: i })),
            userId: req.user.userId,
        }, { include: [ {model: Tag, as: 'tags'}, {model: Ingredient, as: "ingredients"}, {model: Instruction, as: "instructions"} ]})
        res.status(201).json({ data: recipe })
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not create recipe. Please try again later', 400))
    }
})


//-------------------UPDATE RECIPE --------------------//

router.patch('/:recipeId/general', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    const result = await updateById(Recipe, recipeId, req.body);
    if (result.error) {
        console.log(result.error)
        return next(new HttpError('Uh oh, something went wrong. Please try again later'));
    }
    res.json({ data: result.data });
})

router.patch('/:recipeId/cover-img', upload.single('coverImg'), validateImg(5120000), async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    try {
        const newCoverImgUrl = await uploadPic(req.file.path);
        const oldCoverImgUrl = await Recipe.findByPk(recipeId, { attributes: ['coverImg']});
        const result = await updateById(Recipe, recipeId, { coverImg: newCoverImgUrl });
        if (result.error) throw new Error('Uh oh, something went wrong');
        const deletion = await deletePic(oldCoverImgUrl.coverImg);
        if (!deletion.result === 'ok') console.log(deletion);
        res.json({ data: result.data });
    } catch (err) {
        console.log(err.message);
        next (new HttpError(err.message));
    }
})

router.patch('/:recipeId/tags', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    const incoming = req.body.tags;

    try {
        const existing = await Tag.findAll({
            order: [['id', 'ASC']],
            where: { recipeId }
        })
        const tags = await sequelize.transaction(async (t) => (
            await updateRecipeList(Tag, recipeId, incoming, existing, { transaction: t }, true)
        ))
        res.json({ data: { tags} });
    } catch(err) {
        console.log(err.message);
        next (new HttpError(err.message))
    }
})

router.patch('/:recipeId/ingredients', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    const incoming = req.body.ingredients;

    try {
        const existing = await Ingredient.findAll({ 
            order: [['id', 'ASC']], 
            where: { recipeId } 
        })
        const ingredients = await sequelize.transaction(async (t) => (
            await updateRecipeList(Ingredient, recipeId, incoming, existing, { transaction: t })
        ))
        res.json({ data: { ingredients } })
    } catch (err) {
        console.log(err.message);
        next(new HttpError(err.message))
    }
})

router.patch('/:recipeId/instructions', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    const incoming = req.body.instructions;

    try {
        const existing = await Instruction.findAll({ 
            order: [['id', 'ASC']], 
            where: { recipeId } 
        })
        const instructions = await sequelize.transaction(async (t) => (
            await updateRecipeList(Instruction, recipeId, incoming, existing, { transaction: t })
        ))
        res.json({ data: { instructions } })
    } catch (err) {
        console.log(err.message);
        next(new HttpError(err.message))
    }
})

module.exports = router;