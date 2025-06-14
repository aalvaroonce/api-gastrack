const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const UserScheme = new mongoose.Schema(
    {
        name: {
            type: String
        },
        surnames: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        emailCode: {
            type: String
        },
        attempt: {
            type: Number,
            default: 0
        },
        phoneNumber: {
            type: String
        },
        password: {
            type: String,
            select: false
        },
        status: {
            type: Number,
            default: 0
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        urlToAvatar: {
            type: String
        },
        language: {
            type: String,
            default: 'es'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        gasStatations: [
            {
                gasStation: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'gasStation'
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

UserScheme.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('user', UserScheme);
