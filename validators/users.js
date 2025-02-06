const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validación para el registro de usuarios
const validatorRegister = [
    check("name")
        .exists().withMessage("El nombre es requerido")
        .notEmpty().withMessage("El campo nombre no puede estar vacío")
        .isString().withMessage("El nombre debe ser un texto")
        .isLength({ min: 3, max: 99 }).withMessage("El nombre debe tener entre 3 y 99 caracteres"),
    
    check("age")
        .exists().withMessage("La edad es requerida")
        .notEmpty().withMessage("El campo edad no puede estar vacío")
        .isInt({ min: 0 }).withMessage("La edad debe ser un número entero y mayor a 0"),

    check("email")
        .exists().withMessage("El email es requerido")
        .notEmpty().withMessage("El campo email no puede estar vacío")
        .isEmail().withMessage("El email debe ser válido"),

    check("password")
        .exists().withMessage("La contraseña es requerida")
        .notEmpty().withMessage("El campo contraseña no puede estar vacío")
        .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 64 caracteres")
        .matches(/[A-Z]/).withMessage("La contraseña debe contener al menos una letra mayúscula")
        .matches(/[a-z]/).withMessage("La contraseña debe contener al menos una letra minúscula")
        .matches(/[0-9]/).withMessage("La contraseña debe contener al menos un número")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("La contraseña debe contener al menos un carácter especial"),

    check("city")
        .exists().withMessage("La ciudad es requerida")
        .notEmpty().withMessage("El campo ciudad no puede estar vacío")
        .isString().withMessage("La ciudad debe ser un texto"),
    
    check("country")
        .exists().withMessage("El pais es requerido")
        .notEmpty().withMessage("El campo deñ pais no puede estar vacio")
        .isString().withMessage("El pais debe ser un texto"),

    check("role").optional(), // El campo rol es opcional

    (req, res, next) => validateResults(req, res, next)
];

// Validación para el login de usuarios
const validatorLogin = [
    check("email")
        .exists().withMessage("El email es requerido")
        .notEmpty().withMessage("El campo email no puede estar vacío")
        .isEmail().withMessage("El email debe ser válido"),
    
    check("password")
        .exists().withMessage("La contraseña es requerida")
        .notEmpty().withMessage("El campo contraseña no puede estar vacío")
        .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 16 caracteres"),

    (req, res, next) => validateResults(req, res, next)
];  

// Validación para obtener un usuario por su ID
const validatorGetUser = [
    check("id")
        .exists().withMessage("El ID es requerido")
        .notEmpty().withMessage("El campo ID no puede estar vacío")
        .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),
    
    (req, res, next) => validateResults(req, res, next)
];

// Validación para actualizar un usuario
const validatorUpdateUser = [
    check("id")
        .exists().withMessage("El ID es requerido")
        .notEmpty().withMessage("El campo ID no puede estar vacío")
        .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),

    check("name")
        .exists().withMessage("El nombre es requerido")
        .notEmpty().withMessage("El campo nombre no puede estar vacío")
        .isString().withMessage("El nombre debe ser un texto")
        .isLength({ min: 3, max: 99 }).withMessage("El nombre debe tener entre 3 y 99 caracteres"),
    
    check("age")
        .exists().withMessage("La edad es requerida")
        .notEmpty().withMessage("El campo edad no puede estar vacío")
        .isInt({ min: 0 }).withMessage("La edad debe ser un número entero y mayor a 0"),

    check("email")
        .exists().withMessage("El email es requerido")
        .notEmpty().withMessage("El campo email no puede estar vacío")
        .isEmail().withMessage("El email debe ser válido"),

    check("city")
        .exists().withMessage("La ciudad es requerida")
        .notEmpty().withMessage("El campo ciudad no puede estar vacío")
        .isString().withMessage("La ciudad debe ser un texto"),

    check("country")
        .exists().withMessage("El pais es requerido")
        .notEmpty().withMessage("El campo deñ pais no puede estar vacio")
        .isString().withMessage("El pais debe ser un texto"),

    (req, res, next) => validateResults(req, res, next)
];

// Validación para restaurar un usuario por su ID
const validatorRestoreUser = [
    check("id")
        .exists().withMessage("El ID es requerido")
        .notEmpty().withMessage("El campo ID no puede estar vacío")
        .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),

    (req, res, next) => validateResults(req, res, next)
];

// Validación para eliminar un usuario por su ID
const validatorDeleteUser = [
    check("id")
        .exists().withMessage("El ID es requerido")
        .notEmpty().withMessage("El campo ID no puede estar vacío")
        .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),

    (req, res, next) => validateResults(req, res, next)
];

const validatorChangePassword = [
    check("id")
        .exists().withMessage("El ID es requerido")
        .notEmpty().withMessage("El campo ID no puede estar vacío")
        .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),

    check("currentPassword")
        .exists().withMessage("La contraseña es obligatoria")
        .notEmpty().withMessage("El campo contraseña no puede estar vacío")
        .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 64 caracteres")
        .matches(/[A-Z]/).withMessage("La contraseña debe contener al menos una letra mayúscula")
        .matches(/[a-z]/).withMessage("La contraseña debe contener al menos una letra minúscula")
        .matches(/[0-9]/).withMessage("La contraseña debe contener al menos un número")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("La contraseña debe contener al menos un carácter especial"),

    check("newPassword")
        .exists().withMessage("La contraseña es obligatoria")
        .notEmpty().withMessage("El campo contraseña no puede estar vacío")
        .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 64 caracteres")
        .matches(/[A-Z]/).withMessage("La contraseña debe contener al menos una letra mayúscula")
        .matches(/[a-z]/).withMessage("La contraseña debe contener al menos una letra minúscula")
        .matches(/[0-9]/).withMessage("La contraseña debe contener al menos un número")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("La contraseña debe contener al menos un carácter especial"),


    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { 
    validatorRegister, validatorLogin, 
    validatorGetUser, 
    validatorUpdateUser, validatorRestoreUser, validatorChangePassword,
    validatorDeleteUser 
};
