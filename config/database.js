const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres'
})

const models = {
    User: require('../models/User')(sequelize),
    Recipe: require('../models/Recipe')(sequelize),
    Ingredient: require('../models/Ingredient')(sequelize),
    Instruction: require('../models/Instruction')(sequelize),
    Review: require('../models/Review')(sequelize),
    Tag: require('../models/Tag')(sequelize)
}

models.Bookmark = require('../models/Bookmark')(sequelize, models);
models.Follow = require('../models/Follow')(sequelize, models);
models.Like = require('../models/Like')(sequelize, models);

for (let modelName in models) {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
}

const db = { ...models, sequelize, Sequelize };

module.exports = db;