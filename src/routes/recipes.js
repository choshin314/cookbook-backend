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
    Like,
    rawConfig, sequelize, Sequelize: {Op} 
} = db;
const verifyAuth = require('../middleware/verifyAuth');
const validateImg = require('../middleware/validateImg');
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const { uploadPic, deletePic } = require('../helpers/file-uploads');
const { updateById, updateRecipeList, getPublicFeedRawSQL, getPrivateFeedRawSQL, appendReviewsToRecipe } = require('../helpers/query-helpers');
const HttpError = require('../helpers/http-error');
const { SEARCH_LIMIT } = require('../constants');

//----------GET RECIPE BY ID--------------//
router.get('/:recipeId', async (req, res, next) => {
    try {
        const recipe = await Recipe.findByPk(req.params.recipeId, { 
            attributes: [
                'id','title','slug','coverImg','intro','servings','prepTime','cookTime','createdAt','updatedAt',
                [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
                [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating']
            ],
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'profilePic', 'firstName', 'lastName']},
                { 
                    model: Review, 
                    as: 'reviews',
                    attributes: []
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
                'user.id', 
                'ingredients.id',
                'instructions.id',
                'tags.id'
            ]
        })
        if (!recipe) throw new HttpError('Recipe was not found', 404)
        const reviews = await Review.findAll({
            where: { recipeId: recipe.id },
            include: { 
                model: User, 
                as: 'user', 
                attributes: ['username', 'profilePic']
            }, 
            order: [['createdAt', 'DESC']]
        })
        recipe.dataValues.reviews = reviews;
        res.json({ data: recipe })
    } catch(err) {
        return next(err)
    }
})


//-----------GET RECIPES BY USER (UserRecipes & UserBookmarks)------------//
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
            ORDER BY recipes.created_at DESC        
        `, rawConfig(Recipe))
        res.status(200).json({ data: recipes })
    } catch (err) {
        return next(err)
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
            ORDER BY recipes.created_at DESC 
        `, rawConfig(Recipe))
        res.status(200).json({ data: bookmarks });
    } catch (err) {
        return next(err)
    }
})


//-----------------SEARCH FOR RECIPES---------------------//

router.get('/', async (req, res, next) => {
    try {
        let { q, o, filter } = req.query;
        let limitAndOffset = { subQuery: false, limit: SEARCH_LIMIT, offset: parseInt(o) || 0 };
        if (!q) return res.json({ data: [] });
        q = q.trim();
        switch (filter) {
            case "tags": {
                const formattedQuery = q.replace(/[^\w ]+/g,'').replace(/ +|_/g,'_');
                const matchingRecipes = await sequelize.query(`
                    SELECT id FROM (
                        SELECT DISTINCT ON (recipes.id)
                            recipes.id,
                            recipes.title,
                            tags.content,
                            avg(reviews.rating) "avgRating",
                            count(reviews.id) "reviewCount"
                        FROM recipes 
                        LEFT JOIN tags ON recipes.id = tags.recipe_id
                        LEFT JOIN reviews ON recipes.id = reviews.recipe_id
                        WHERE tags.content ILIKE '%${q}%' 
                        GROUP BY recipes.id, tags.content, tags.id
                        ORDER BY recipes.id
                    ) t
                    ORDER BY "reviewCount" DESC, "avgRating" DESC, title ASC
                    LIMIT ${SEARCH_LIMIT}
                    OFFSET ${parseInt(o) || 0}
                `, { type: sequelize.QueryTypes.SELECT})
                
                const resultPromises = matchingRecipes.map(appendReviewsToRecipe)
                results = await Promise.all(resultPromises)
                break;
            }

            case "title": {
                const matchingRecipes = await sequelize.query(`
                    SELECT 
                        recipes.id,
                        recipes.title,
                        avg(reviews.rating) "avgRating",
                        count(reviews.id) "reviewCount",
                        count(likes.user_id) "likeCount" 
                    FROM recipes
                    LEFT JOIN reviews ON recipes.id = reviews.recipe_id 
                    LEFT JOIN likes ON recipes.id = likes.recipe_id
                    WHERE recipes.title ILIKE '%${q}%'
                    GROUP BY recipes.id
                    ORDER BY "reviewCount" DESC, "avgRating" DESC, title ASC
                    LIMIT ${SEARCH_LIMIT}
                    OFFSET ${parseInt(o) || 0}
                `, { type: sequelize.QueryTypes.SELECT })

                const resultPromises = matchingRecipes.map(appendReviewsToRecipe)
                results = await Promise.all(resultPromises)

                break;
            }

            default: {//search tags + recipe titles
                const matchingRecipes = await sequelize.query(`
                    SELECT id FROM (
                        SELECT DISTINCT ON (recipes.id)
                            recipes.id,
                            recipes.title,
                            tags.content,
                            avg(reviews.rating) "avgRating",
                            count(reviews.id) "reviewCount"
                        FROM recipes 
                        LEFT JOIN tags ON recipes.id = tags.recipe_id
                        LEFT JOIN reviews ON recipes.id = reviews.recipe_id
                        WHERE 
                            tags.content ILIKE '%${q}%' OR 
                            recipes.title ILIKE '%${q}%'
                        GROUP BY recipes.id, tags.content, tags.id
                        ORDER BY recipes.id
                    ) t
                    ORDER BY "reviewCount" DESC, "avgRating" DESC, title ASC
                    LIMIT ${SEARCH_LIMIT}
                    OFFSET ${parseInt(o) || 0}
                `, { type: sequelize.QueryTypes.SELECT})
                
                const resultPromises = matchingRecipes.map(appendReviewsToRecipe)
                results = await Promise.all(resultPromises)
            }
        }
        res.json({ data: results })
    } catch (err) {
        return next(err);
    }
})

//-----------------------PUBLIC FEED-----------------------------//

router.get('/feed/public', async (req, res, next) => {
    let recipes;
    let { older: olderThanTime, newer: newerThanTime } = req.query;
    try {
        if(olderThanTime) {
            //olderThan should already come in ISOString format but reconvert just in case
            olderThanTime = new Date(req.query.older).toISOString();
            recipes = await sequelize.query(getPublicFeedRawSQL("olderThan", olderThanTime))
        } else if (newerThanTime) {
            newerThanTime = new Date(req.query.newer).toISOString();
            recipes = await sequelize.query(getPublicFeedRawSQL("newerThan", newerThanTime));
        } else {
            throw new Error('No query')
        }
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
            updatedAt: r.updated_at,
            createdAt: r.created_at,
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
        return next(err)
    }
})

//--------------------PROTECTED ROUTES--------------------//
router.use(verifyAuth);

//-------------------CREATE RECIPE --------------------//
router.post('/', upload.single('coverImg'), async (req, res, next) => {
    // if (!req.user.userId) return next(new HttpError('Not authorized', 401));
    let { 
        title, intro, cookTime, prepTime, servings, instructions, tags, ingredients 
    } = JSON.parse(req.body.formJSON);
    try {
        let coverImg = await uploadPic(req.file.path);
        const result = await sequelize.transaction(async (t) => {
            const recipe = await Recipe.create({
                title,
                intro,
                slug: convertToSlug(title),
                coverImg,
                servings,
                prepTime,
                cookTime,
                userId: req.user.userId
            }, { transaction: t })
        
            for (let tag of tags) {
                await Tag.create({ 
                    content: tag.content, 
                    recipeId: recipe.id 
                }, { transaction: t })
            }
            for (let i = 0; i < instructions.length; i++) {
                await Instruction.create({ 
                    content: instructions[i].content, 
                    position: i,
                    recipeId: recipe.id  
                }, { transaction: t })
            }
            for (let i = 0; i < ingredients.length; i++) {
                await Ingredient.create({ 
                    content: ingredients[i].content,
                    qty: ingredients[i].qty,
                    unit: ingredients[i].unit, 
                    position: i,
                    recipeId: recipe.id  
                }, { transaction: t })
            }
        
            return await Recipe.findByPk(recipe.id, { 
                include: [
                    { model: Ingredient, as: 'ingredients' },
                    { model: Instruction, as: 'instructions' },
                    { model: Tag, as: 'tags' }
                ]
            })
        })
        res.status(201).json({ data: result })
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not create recipe. Please try again later', 400))
    }
})



//-------------------UPDATE RECIPE --------------------//

router.patch('/:recipeId/general', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    try {
        const result = await updateById(Recipe, recipeId, req.body);
        if (result.error) throw new Error(result.error);
        res.json({ data: result.data });
    } catch (err) {
        return next(err);
    }
})

router.patch('/:recipeId/cover-img', upload.single('coverImg'), validateImg(5120000), async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    try {
        const newCoverImgUrl = await uploadPic(req.file.path);
        const oldCoverImgUrl = await Recipe.findByPk(recipeId, { attributes: ['coverImg']});
        const result = await updateById(Recipe, recipeId, { coverImg: newCoverImgUrl });
        if (result.error) throw new Error(result.error);
        const deletion = await deletePic(oldCoverImgUrl.coverImg);
        if (!deletion.result === 'ok') console.log(deletion);
        res.json({ data: result.data });
    } catch (err) {
        return next(err);
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
        return next(err);
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
        return next(err);
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
        return next(err);
    }
})

//-------------------DELETE RECIPE----------------------//
router.delete('/:recipeId', async (req, res, next) => {
    const recipeId = parseInt(req.params.recipeId);
    const userId = req.user.userId; 
    
    try {
        const userOwnedRecipe = await Recipe.findOne({ where: { userId, id: recipeId }})
        if (!userOwnedRecipe) throw new HttpError('User not authorized to delete this recipe', 403)
        await userOwnedRecipe.destroy();
        res.json({ data: userOwnedRecipe }) //sends back delete recipe
    } catch (err) {
        return next(err);
    }
})

//--------------------PRIVATE FEED---------------------//
router.get('/feed/private', async (req, res, next) => {
    let recipes;
    let { older: olderThanTime, newer: newerThanTime } = req.query;
    let { userId } = req.user;
    try {
        if(olderThanTime) {
            olderThanTime = new Date(req.query.older).toISOString();
            recipes = await sequelize.query(getPrivateFeedRawSQL("olderThan", olderThanTime, userId))
        } else if (newerThanTime) {
            newerThanTime = new Date(req.query.newer).toISOString();
            recipes = await sequelize.query(getPrivateFeedRawSQL("newerThan", newerThanTime, userId));
        } else {
            throw new Error('No query')
        }
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
            updatedAt: r.updated_at,
            createdAt: r.created_at,
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
        return next(err)
    }
})

module.exports = router;