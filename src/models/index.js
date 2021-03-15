const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize = new Sequelize(process.env[config.use_env_variable], config);

const models = {
  User: require('./User')(sequelize, Sequelize.DataTypes),
  Recipe: require('./Recipe')(sequelize, Sequelize.DataTypes),
  Ingredient: require('./Ingredient')(sequelize, Sequelize.DataTypes),
  Instruction: require('./Instruction')(sequelize, Sequelize.DataTypes),
  Review: require('./Review')(sequelize, Sequelize.DataTypes),
  Tag: require('./Tag')(sequelize, Sequelize.DataTypes),
  Bookmark: require('./Bookmark')(sequelize, Sequelize.DataTypes),
  Follow: require('./Follow')(sequelize, Sequelize.DataTypes),
  Like: require('./Like')(sequelize, Sequelize.DataTypes),
  Token: require('./Token')(sequelize, Sequelize.DataTypes)
}

for (let modelName in models) {
  db[modelName] = models[modelName]
  if (models[modelName].associate) {
      models[modelName].associate(models);
  }
}

db.rawConfig = (model) => ({ 
  model: model, 
  mapToModel: true, 
  nest: true, 
  raw: true 
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
