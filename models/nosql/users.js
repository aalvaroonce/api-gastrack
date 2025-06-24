const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const UserScheme = new mongoose.Schema(
    {
        name: { type: String },
        surnames: { type: String },
        email: { type: String, required: true, unique: true },
        emailCode: { type: String },
        attempt: { type: Number, default: 0 },
        phoneNumber: { type: String },
        password: { type: String, select: false },
        status: { type: Number, default: 0 },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        urlToAvatar: { type: String },
        language: { type: String, default: 'es' },
        notifications: { type: Boolean, default: true },
        deleted: { type: Boolean, default: false, select: false },

        gasStatations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'gasStation'
            }
        ],

        vehicles: [
            {
                default: { type: Boolean, default: false },
                obd: { type: Boolean },
                urlToVehicle: { type: String },
                brand: { type: String },
                model: { type: String },
                year: { type: Number },
                fuelCapacity: { type: Number }, // litros
                percentToRefuel: { type: Number },
                fuelType: {
                    type: String,
                    fuelType: {
                        type: String,
                        enum: [
                            'adblue',
                            'amoniaco',
                            'biodiesel',
                            'bioethanol',
                            'biogasNaturalComprimido',
                            'biogasNaturalLicuado',
                            'diesel',
                            'dieselPremium',
                            'dieselRenovable',
                            'gasNaturalComprimido',
                            'gasNaturalLicuado',
                            'gasoleoB',
                            'gpl',
                            'hydrogen',
                            'methanol',
                            'petrol95',
                            'petrol95E10',
                            'petrol95E25',
                            'petrol95E5Premium',
                            'petrol95E85',
                            'petrol98',
                            'petrol98E10',
                            'petrolRenovable'
                        ]
                    }
                },
                vehicleType: {
                    type: String,
                    default: 'car'
                },
                favoriteGasBrand: {
                    type: String
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
