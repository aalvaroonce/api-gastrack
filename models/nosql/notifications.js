// models/notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        title: {
            type: String
        },
        message: {
            type: String
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'error'],
            default: 'info'
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('notification', NotificationSchema);
