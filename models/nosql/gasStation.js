const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const GasStationSchema = new mongoose.Schema(
    {
        idEESS: { type: String, required: true, unique: true },
        latitude: Number,
        longitude: Number,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        address: String,
        zipCode: String,
        city: String,
        municipality: String,
        province: String,
        schedule: String,
        brand: String,
        idMunicipality: String,
        idProvince: String,
        idCCAA: String,
        sellingType: String,
        remission: String,
        margin: String,
        bioEthanolPct: String,
        methilEster: String,
        saved: { type: Boolean, default: false },
        reviews: {
            scoring: { type: Number, default: 0 },
            totalRatings: { type: Number, default: 0 },
            reviewTexts: [
                {
                    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                    rating: { type: Number, min: 1, max: 5 },
                    comment: String,
                    createdAt: { type: Date, default: Date.now },
                    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
                    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
                }
            ]
        }
    },
    { timestamps: true }
);

// Índice geoespacial
GasStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('gasStation', GasStationSchema);
