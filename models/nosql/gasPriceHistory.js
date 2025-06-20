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
            petrol95E25: Number,
            petrol95E85: Number,
            petrol98: Number,
            petrol98E10: Number,
            petrolRenovable: Number,
            gpl: Number,
            biodiesel: Number,
            bioethanol: Number,
            biogasNaturalComprimido: Number,
            biogasNaturalLicuado: Number,
            gasNaturalComprimido: Number,
            gasNaturalLicuado: Number,
            dieselRenovable: Number,
            gasoleoB: Number,
            hydrogen: Number,
            methanol: Number,
            adblue: Number,
            amoniaco: Number
        }
    },
    { timestamps: true }
);

GasPriceHistorySchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('gasPriceHistory', GasPriceHistorySchema);
