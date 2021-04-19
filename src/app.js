require('dotenv').config();
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const db = require('./models');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const socialRoutes = require('./routes/social');
const reviewRoutes = require('./routes/reviews');
const HttpError = require('./helpers/http-error');

//-------------DB--------------//
db.initDedicatedListener((msgPayload) => {
    console.log('msg received')
    console.log(msgPayload)
})

db.sequelize.authenticate()
    .then(() => console.log('database connected'))
    .catch(err => console.log('Error: ' + err));
    
//-------------APPWIDE MIDDLEWARE--------------//
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//-------------ROUTES--------------//
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/reviews', reviewRoutes);

//-------------ERROR HANDLING--------------//
app.use((err, req, res, next) => {
    console.log(err.message);
    HttpError.handleError(err, res);
})

app.listen(process.env.PORT || 5001, () => {
    console.log(`Listening on port ${process.env.PORT || 5001}`)
})

module.exports = app;