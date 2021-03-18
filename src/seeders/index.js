require('dotenv').config();
const db = require('../models');
const rawRecipes = require('./seedData.json');

(async function() {
    try {
        let results = [];
        for(let r of rawRecipes) {
            const result = await db.sequelize.transaction(async (t) => {
                const recipe = await db.Recipe.create({
                    ...r,
                    userId: process.env.SEED_USER,
                }, { transaction: t })

                for (let tag of r.tags) {
                    await db.Tag.create({
                        content: tag.content,
                        recipeId: recipe.id
                    }, { transaction: t })
                }

                for (let inst of r.instructions) {
                    await db.Instruction.create({
                        ...inst,
                        recipeId: recipe.id
                    }, { transaction: t })
                }

                for (let ing of r.ingredients) {
                    await db.Ingredient.create({
                        ...ing,
                        recipeId: recipe.id
                    }, { transaction: t })
                }

                return recipe
            })

            results.push(result)
        }
        console.log('success')
        return results
    } catch (err) {
        console.log(err.message);
    }
})()