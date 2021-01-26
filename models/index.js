const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const models = {
    User: require('./User'),
    Recipe: require('./Recipe'),
    Ingredient: require('./Ingredient'),
    Instruction: require('./Instruction'),
    Review: require('./Review'),
    Tag: require('./Tag')
}

models.Bookmark = require('./Bookmark')(models);
models.Follow = require('./Follow')(models);
models.Like = require('./Like')(models);

for (let modelName in models) {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;