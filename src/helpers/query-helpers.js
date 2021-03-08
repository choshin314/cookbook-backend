const { FEED_LIMIT } = require('../constants');
const { 
    User, 
    Recipe, 
    Review, 
    Ingredient, 
    Instruction, 
    Tag, 
    Bookmark, 
    Follow,
    Like,
    sequelize
} = require('../config/database');

async function updateById(model, id, newValuesObj, transaction) {
    const newValueKeys = Object.keys(newValuesObj);
    try {
        await model.update(newValuesObj, { where: { id: id }, ...transaction });
        const updatedVals = await model.findByPk(id, { attributes: [ ...newValueKeys ], ...transaction });
        return { data: updatedVals }
    } catch(err) {
        return { error: err.message }
    }
}

async function updateRecipeList(model, recipeId, incomingList, existingItems, transaction, areTags=false) {
    const updatedItems = [];
    for (let i = 0; i < incomingList.length; i++) {
        let finalItem;
        let position = !areTags ? { position: i } : null;
        let incomingItem = incomingList[i];
        if (typeof incomingItem.id === "string") {
            delete incomingItem.id;
            finalItem = await model.create({
                ...incomingItem,
                recipeId: recipeId,
                ...position
            }, transaction)
        } else {
            await updateById(model, incomingItem.id, {
                ...incomingItem,
                ...position
            }, transaction);
            finalItem = await model.findByPk(incomingItem.id);
        }
        updatedItems.push(finalItem);
    }
    const updatesSortedById = [...updatedItems].sort((a, b) => a.id - b.id);
    let updatesPointer = 0;
    for (let i = 0; i < existingItems.length; i++) {
        if (!updatesSortedById[updatesPointer] || existingItems[i].id !== updatesSortedById[updatesPointer].id) {
            await model.destroy({ where: { id: existingItems[i].id }}, transaction);
            continue;
        } 
        updatesPointer++;
    }
    return updatedItems;
}

function getPublicFeedRawSQL(fetchType, dateTime) {
    let operator;
    if (fetchType === "newerThan") {
        operator = ">"
    }
    if (fetchType == "olderThan") {
        operator = "<"
    }
    return (`
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
        WHERE recipes.created_at ${operator} '${dateTime}'
        GROUP BY 
            recipes.id, 
            users.username, 
            users.profile_pic, 
            users.first_name, 
            users.last_name 
        ORDER BY 
            recipes.created_at DESC, 
            "likeCount" DESC, 
            "reviewCount" DESC, 
            "avgRating" DESC
        LIMIT ${FEED_LIMIT}
    `);
}

function getPrivateFeedRawSQL(fetchType, dateTime, userId) {
    let operator;
    if (fetchType === "newerThan") {
        operator = ">"
    }
    if (fetchType === "olderThan") {
        operator = "<"
    }
    return (`
        SELECT
            recipes.*,
            count(likes.*) "likeCount",
            count(reviews.*) "reviewCount",
            avg(reviews.rating) "avgRating",
            users.username, users.profile_pic, users.first_name, users.last_name
        FROM follows 
        INNER JOIN recipes ON follows.followee_id = recipes.user_id 
        LEFT JOIN likes ON recipes.id = likes.recipe_id
        LEFT JOIN reviews ON recipes.id = reviews.recipe_id
        LEFT JOIN users ON recipes.user_id = users.id
        WHERE 
            follower_id = '${userId}' AND
            recipes.created_at ${operator} '${dateTime}'
        GROUP BY 
            recipes.id,
            users.username,
            users.profile_pic,
            users.first_name,
            users.last_name
        ORDER BY recipes.created_at DESC
        LIMIT ${FEED_LIMIT};
    `)
}

async function appendReviewsToRecipe(rec) {
    const recipePlusReviews = await Recipe.findByPk(rec.id, { 
        attributes: [
            'id','title','coverImg','slug',
            [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
            [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('likes.recipe_id')), 'likeCount']
        ],
        include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'profilePic', 'firstName', 'lastName']},
            { model: Review, as: 'reviews', attributes: [] },
            { model: Like, as: 'likes' }
        ],
        group: ['Recipe.id', 'user.id', 'likes.recipe_id', 'likes.user_id']
    })
    const reviews = await Review.findAll({
        where: { recipeId: rec.id },
        include: { model: User, as: 'user', attributes: ['username', 'profilePic'] }, 
        order: [['createdAt', 'DESC']]
    })
    recipePlusReviews.dataValues.reviews = reviews;
    return recipePlusReviews;
}

module.exports = { updateById, updateRecipeList, getPublicFeedRawSQL, getPrivateFeedRawSQL, appendReviewsToRecipe }