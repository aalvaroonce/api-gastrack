const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const GasPriceHistorySchema = new mongoose.Schema(
    {
        gasStation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'gasStation',
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        prices: {
            diesel: Number,
            dieselPremium: Number,
            petrol95: Number,
            petrol95E10: Number,
            petrol95E5Premium: Number,
            petrol98: Number,
            petrol98E10: Number,
            gpl: Number,
            biodiesel: Number,
            bioethanol: Number,
            gasNaturalLicuado: Number,
            gasNaturalComprimido: Number,
            gasoleoB: Number,
            hydrogen: Number
        }
    },
    { timestamps: true }
);

GasPriceHistorySchema.index({ gasStation: 1, date: 1 }, { unique: true }); // una entrada por día por gasolinera

module.exports = mongoose.model('gasPriceHistory', GasPriceHistorySchema);
