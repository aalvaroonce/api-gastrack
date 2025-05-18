const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const GasStationSchema = new mongoose.Schema(
    {
        idEESS: { type: String, required: true, unique: true }, // identificador oficial
        latitude: Number,
        longitude: Number,
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
        reviews: {
            scoring: {
                type: Number,
                default: 0
            },
            totalRatings: {
                type: Number,
                default: 0
            },
            reviewTexts: [
                {
                    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                    rating: { type: Number, min: 1, max: 5 },
                    comment: String,
                    createdAt: { type: Date, default: Date.now }
                }
            ]
        }
    },
    { timestamps: true }
);

GasStationSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('gasStation', GasStationSchema);
