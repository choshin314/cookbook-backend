require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, require('./sockets/config'));
const db = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notificationHandler = require('./sockets/notificationHandler');

//-------------DB--------------//
db.sequelize.authenticate()
    .then(() => console.log('database connected'))
    .catch(err => console.log('Error: ' + err));
    
//-------------APPWIDE MIDDLEWARE--------------//
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//-------------ROUTES--------------//
app.use('/api/auth', routes.authRoutes);
app.use('/api/account', routes.accountRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/recipes', routes.recipeRoutes);
app.use('/api/social', routes.socialRoutes);
app.use('/api/reviews', routes.reviewRoutes);

//-------------ERROR HANDLING--------------//
app.use(errorHandler)

function onConnection(socket) {
    const { user } = socket.handshake.headers;
    console.log('a user connected: ' + user);
    socket.join(user);
    notificationHandler(io, user)
}

io.on('connection', onConnection)

server.listen(process.env.PORT || 5001, () => {
    console.log(`Listening on port ${process.env.PORT || 5001}`)
})

module.exports = app;