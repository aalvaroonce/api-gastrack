const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const fuelTypes = [
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
];

const validatorAddVehicle = [
    check('brand').exists().isString(),
    check('model').exists().isString(),
    check('year').optional().isNumeric(),
    check('fuelCapacity').optional().isNumeric(),
    check('fuelType').exists().isIn(fuelTypes),
    check('vehicleType').optional().isString(),
    check('favoriteGasBrand').optional().isString(),
    check('default').optional().isBoolean(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUpdateVehicle = [
    check('brand').optional().isString(),
    check('model').optional().isString(),
    check('year').optional().isNumeric(),
    check('fuelCapacity').optional().isNumeric(),
    check('fuelType').optional().isIn(fuelTypes),
    check('vehicleType').optional().isString(),
    check('favoriteGasBrand').optional().isString(),
    check('default').optional().isBoolean(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = {
    validatorAddVehicle,
    validatorUpdateVehicle
};
