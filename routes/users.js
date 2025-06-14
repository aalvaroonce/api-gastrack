// Importamos el módulo express
const express = require('express');
const {
    updateUser,
    getUsers,
    deleteUser,
    getUser,
    restoreUser,
    changePassword
} = require('../controllers/users');
const {
    validatorRegister,
    validatorLogin,
    validatorGetUser,
    validatorUpdateUser,
    validatorRestoreUser,
    validatorDeleteUser,
    validatorChangePassword,
    validatorEmailCode,
    validatorEmailRecover,
    validatorEmail
} = require('../validators/users');
const authMiddleware = require('../middleware/session');
const { checkRol, checkUserId } = require('../middleware/rol');
const {
    registerCtrl,
    loginCtrl,
    validateEmail,
    validateEmailRecover,
    recoverPass
} = require('../controllers/auth');

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *  get:
 *      tags:
 *      - User
 *      summary: Get all users
 *      description: Get all users from the db
 *      responses:
 *          '200':
 *              description: Returns the users
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.get('/', authMiddleware, checkRol(['admin']), getUsers);

// Obtener usuario especifivo
/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Obtener un usuario por id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del usuario
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Usuario obtenido
 *       '404':
 *         description: No se encontró el usuario
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authMiddleware, getUser);

/**
 * @openapi
 * /api/user/register:
 *  post:
 *      tags:
 *      - User
 *      summary: User registration
 *      description: Registers a new user with an email and password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userRegister"
 *      responses:
 *          '200':
 *              description: Returns the inserted object and JWT Token
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '409':
 *              description: User exists.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error.
 */
router.post('/register', validatorRegister, registerCtrl);

/**
 * @openapi
 * /api/user/login:
 *  post:
 *      tags:
 *      - User
 *      summary: "User login"
 *      description: Login a user with email and password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/userLogin"
 *      responses:
 *          '200':
 *              description: Ok. Returns the JWT Token.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userDataLogin"
 *          '401':
 *              description: User is not validated.
 *          '404':
 *              description: User not found.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.post('/login', validatorLogin, loginCtrl);

/**
 * @openapi
 * /api/user/validation-mail:
 *  put:
 *      tags:
 *      - User
 *      summary: "User email validation"
 *      description: Validates the user's mail
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailCode"
 *      responses:
 *          '200':
 *              description: Ok. Changes status field to 1 and returns an object with acknowledged to true
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/validation-mail', authMiddleware, validatorEmailCode, validateEmail);

/**
 * @openapi
 * /api/user/validation-psswd:
 *  put:
 *      tags:
 *      - User
 *      summary: "User email validation to recover password"
 *      description: Validates the user's mail
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailRecover"
 *      responses:
 *          '200':
 *              description: Ok. Returns user and token to change the password
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '401':
 *              description: Unauthorized. Authentication token is missing or invalid.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.put('/validation-psswd', validatorEmailRecover, validateEmailRecover);

/**
 * @openapi
 * /api/user/recover-psswd:
 *  put:
 *      tags:
 *      - User
 *      summary: "Recover token"
 *      description: Recover user token to validate and change password
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/mailUser"
 *      responses:
 *          '200':
 *              description: OK. Send mail with code to verify.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userData"
 *          '404':
 *              description: User email not found.
 *          '409':
 *              description: User is not validated.
 *          '422':
 *              description: Validation error. The request body contains invalid fields.
 *          '500':
 *              description: Internal server error
 */
router.put('/recover-psswd', validatorEmail, recoverPass);

/**
 * @openapi
 * /api/users/{id}:
 *  put:
 *      tags:
 *      - User
 *      summary: Update user
 *      description: Update a user by an admin or the user updates his info (only amin can update role)
 *      parameters:
 *          -   name: id
 *              in: path
 *              description: id that need to be updated
 *              required: true
 *              schema:
 *                  type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/user"
 *      responses:
 *          '200':
 *              description: Returns the inserted object
 *          '400':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/:id', authMiddleware, checkUserId(['admin']), validatorUpdateUser, updateUser);

/**
 * @openapi
 * /api/users/restore/{id}:
 *  put:
 *      tags:
 *      - User
 *      summary: Restore a user
 *      description: Admin can restore a user by his id
 *      parameters:
 *          -   name: id
 *              in: path
 *              description: id that need to be updated
 *              required: true
 *              schema:
 *                  type: string
 *      responses:
 *          '200':
 *              description: Returns the inserted object
 *          '400':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/restore/:id', authMiddleware, checkRol(['admin']), validatorRestoreUser, restoreUser);

/**
 * @openapi
 * /api/users/changepswd/{id}:
 *  post:
 *      tags:
 *      - user
 *      summary: Change password for a user
 *      description: Allows a user to update its password by verifying the current password.
 *      parameters:
 *          - name: id
 *            in: path
 *            description: id of the user for which the password is being changed
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          currentPassword:
 *                              type: string
 *                              example: OldPassword123
 *                          newPassword:
 *                              type: string
 *                              example: NewPassword456
 *                      required:
 *                          - currentPassword
 *                          - newPassword
 *      responses:
 *          '200':
 *              description: Password successfully changed
 *          '401':
 *              description: Unauthorized - Incorrect current password
 *          '404':
 *              description: User not found
 *          '400':
 *              description: Validation error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put('/changepswd/:id', authMiddleware, validatorChangePassword, changePassword);

/**
 * @openapi
 * /api/users/{id}:
 *  delete:
 *      tags:
 *      - User
 *      summary: Delete user
 *      description: Delete a user by an admin or the same user
 *      parameters:
 *          -   name: id
 *              in: path
 *              description: id that need to be deleted
 *              required: true
 *              schema:
 *                  type: string
 *      responses:
 *          '200':
 *              description: Returns the status
 *          '400':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.delete('/:id', authMiddleware, checkUserId(['admin']), validatorDeleteUser, deleteUser);

// Exportamos el router para que pueda ser utilizado en otras partes de la aplicación
module.exports = router;
