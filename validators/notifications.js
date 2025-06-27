const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetNotification = [
    check('id')
        .exists()
        .withMessage('El ID de la notificación es requerido')
        .notEmpty()
        .withMessage('El campo ID no puede estar vacío')
        .isMongoId()
        .withMessage('Debe ser un ID válido de MongoDB'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdateNotificationStatus = [
    check('id')
        .exists()
        .withMessage('El ID de la notificación es requerido')
        .notEmpty()
        .withMessage('El campo ID no puede estar vacío')
        .isMongoId()
        .withMessage('Debe ser un ID válido de MongoDB'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorDeleteNotification = [
    check('id')
        .exists()
        .withMessage('El ID de la notificación es requerido')
        .notEmpty()
        .withMessage('El campo ID no puede estar vacío')
        .isMongoId()
        .withMessage('Debe ser un ID válido de MongoDB'),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validatorGetNotification,
    validatorUpdateNotificationStatus,
    validatorDeleteNotification
};
