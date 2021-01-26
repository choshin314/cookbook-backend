require('dotenv').config();
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const sequelize = require('./config/database');
const models = require('./models');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');

//-------------DB--------------//
sequelize.authenticate()
    .then(() => console.log('database connected'))
    .catch(err => console.log('Error: ' + err));

//-------------APPWIDE MIDDLEWARE--------------//
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//-------------ROUTES--------------//

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

//-------------ERROR HANDLING--------------//
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.code || 500);
    res.json({ message: err.message || 'An unknown error occurred!' })
})

app.listen(process.env.PORT || 5001, () => {
    console.log(`Listening on port ${process.env.PORT || 5001}`)
})