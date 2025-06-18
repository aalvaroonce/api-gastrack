module.exports = {
    type: 'object',
    required: ['brand', 'model', 'fuelType'],
    properties: {
        brand: {
            type: 'string',
            example: 'Toyota'
        },
        model: {
            type: 'string',
            example: 'Corolla'
        },
        year: {
            type: 'integer',
            example: 2020
        },
        fuelCapacity: {
            type: 'number',
            example: 50
        },
        fuelType: {
            type: 'string',
            enum: [
                'diesel',
                'dieselPremium',
                'petrol95',
                'petrol95E10',
                'petrol95E5Premium',
                'petrol98',
                'petrol98E10',
                'gpl',
                'biodiesel',
                'bioethanol',
                'gasNaturalLicuado',
                'gasNaturalComprimido',
                'gasoleoB',
                'hydrogen'
            ],
            example: 'petrol95'
        },
        vehicleType: {
            type: 'string',
            example: 'car'
        },
        favoriteGasBrand: {
            type: 'string',
            example: 'Repsol'
        },
        default: {
            type: 'boolean',
            example: false
        }
    }
};
