const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres'
})

const models = {
    User: require('../models/User')(sequelize, DataTypes, Sequelize),
    Recipe: require('../models/Recipe')(sequelize, DataTypes),
    Ingredient: require('../models/Ingredient')(sequelize, DataTypes),
    Instruction: require('../models/Instruction')(sequelize, DataTypes),
    Review: require('../models/Review')(sequelize, DataTypes),
    Tag: require('../models/Tag')(sequelize, DataTypes),
    Bookmark: require('../models/Bookmark')(sequelize, DataTypes),
    Follow: require('../models/Follow')(sequelize, DataTypes),
    Like: require('../models/Like')(sequelize, DataTypes)
}

for (let modelName in models) {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
}

const rawConfig = (model) => ({ model: model, mapToModel: true, nest: true, raw: true });

const db = { ...models, rawConfig, sequelize, Sequelize };

module.exports = db;