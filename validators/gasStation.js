const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

// Validadores
const validatorIdEESS = [
    check('idEESS').exists().notEmpty().isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];
const validatorReview = [
    check('idEESS').exists().notEmpty().isString(),
    check('rating').notEmpty().isInt({ min: 1, max: 5 }),
    check('comment').optional().notEmpty().isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorReviewInteraction = [
    param('idEESS').exists().notEmpty().isString().withMessage('idEESS es requerido'),
    param('reviewId').exists().isMongoId().withMessage('reviewId debe ser un ID válido'),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorIdEESS, validatorReview, validatorReviewInteraction };
