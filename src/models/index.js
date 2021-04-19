const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const DATABASE_URL = process.env.DATABASE_URL;
const { Client } = require('pg')
const db = {};

//-------------DB--------------//
const initDedicatedListener = async (notificationCallback) => {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        await client.query('LISTEN new_notification')
        client.on('notification', msg => {
            console.log(msg.payload)
            notificationCallback(msg.payload)
        })
    } catch(err) {
        console.error('pg client connection error', err.stack)
    }
}

let sequelize = new Sequelize(DATABASE_URL, config);

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
    Token: require('./Token')(sequelize, Sequelize.DataTypes),
    Notification: require('./Notification')(sequelize, Sequelize.DataTypes)
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
db.initDedicatedListener = initDedicatedListener;

module.exports = db;
