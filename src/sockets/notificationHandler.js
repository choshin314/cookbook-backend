const { pgClient } = require('../models')

function notificationHandler(io, userId) {
    pgClient.on('notification', msg => {
        const payload = JSON.parse(msg.payload)
        if(payload.recipientId === userId) {
            io.to(userId).emit("newNotification", payload)
        }
    })
}

module.exports = notificationHandler