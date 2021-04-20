const db = require('../models');
const HttpError = require('../helpers/http-error');

//get all notifications
async function getNotifications(req, res, next) {
    const { userId } = req.user;
    const { offsetId } = req.query;
    try {
        const user = await db.User.findByPk(userId);
        if (!user) throw new HttpError('Could not find user', 404);
        const notifications = await db.Notification.findNested({ recipientId: userId, offsetId });
        console.log(notifications);
        res.json({ data: notifications })
    } catch (err) {
        return next(err)
    }
}
//patch notifications 
async function checkNotifications(req, res, next) {
    const notificationIds = req.body;
    try {
        if (!notificationIds) throw new HttpError('Nothing to update', 400);
        const updateCount = await db.sequelize.transaction(async (t) => {
            let updated = 0;
            for (id of notificationIds) {
                const affected = await db.Notification.update({ 
                    checked: true 
                }, { 
                    where: { id: id }, 
                    transaction: t 
                })
                updated += affected[0]; //model.update returns arr. arr[0] = total rows affected - should be 1 each.
            }
            return updated;
        })
        res.json({ data: updateCount })
    } catch(err) {
        return next(err)
    }
}

module.exports = {
    getNotifications,
    checkNotifications
}