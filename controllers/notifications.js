const { matchedData } = require('express-validator');
const { notificationsModel, userModel } = require('../models');
// const sendPushNotification = require('../utils/handleNotifications');

const getNotification = async (req, res) => {
    const { id } = matchedData(req);
    const userId = req.user._id;
    try {
        const notification = await notificationsModel.findOne({ _id: id, userId });
        if (!notification) {
            return res.status(404).send('NOTIFICATION_NOT_FOUND');
        }
        res.status(200).json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_GETTING_NOTIFICATION');
    }
};

const getNotifications = async (req, res) => {
    const userId = req.user._id;
    try {
        const notifications = await notificationsModel.find({ userId }).sort({ createdAt: -1 });
        if (!notifications || notifications.length === 0) {
            return res.status(404).send('NO_NOTIFICATIONS_YET');
        }
        res.status(200).send(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_GETTING_NOTIFICATIONS');
    }
};

const updateNotificationStatus = async (req, res) => {
    const { id, state } = matchedData(req);
    const userId = req.user._id;
    try {
        const notification = await notificationsModel.findOneAndUpdate(
            { _id: id, userId },
            { state },
            { new: true }
        );
        if (!notification) {
            return res.status(404).send('NOTIFICATION_NOT_FOUND');
        }
        res.status(200).send(notification);
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_UPDATING_NOTIFICATION');
    }
};

const deleteNotification = async (req, res) => {
    const { id } = matchedData(req);
    const userId = req.user._id;
    try {
        const notification = await notificationsModel.findOneAndDelete({ _id: id, userId });
        if (!notification) {
            return res.status(404).send('NOTIFICATION_NOT_FOUND');
        }
        res.status(200).send('NOTIFICATION_DELETED');
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_DELETING_NOTIFICATION');
    }
};

const setNotification = async (userId, name, message) => {
    try {
        await notificationsModel.create({
            userId,
            name,
            message
        });

        const user = userModel.findById(userId);

        // if (user.allowNotifications == true) {
        //     await sendPushNotification(user.token, name, message);
        // }
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    getNotification,
    getNotifications,
    updateNotificationStatus,
    setNotification,
    deleteNotification
};
