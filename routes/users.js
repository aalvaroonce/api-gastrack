// Importamos el módulo express
const express = require("express")
const { registerCtrl, loginCtrl, updateUser, getUsers, deleteUser, getUser, restoreUser } = require("../controllers/users")
const { validatorRegister, validatorLogin, validatorGetUser, validatorUpdateUser, validatorRestoreUser, validatorDeleteUser } = require("../validators/users")
const {authMiddleware} = require("../middleware/session")
const { checkRol, checkUserRol, checkUserId } = require("../middleware/rol")
// Creamos una nueva instancia del Router de express para manejar las rutas
const router = express.Router()

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
router.get("/", authMiddleware, checkRol(["admin"]), getUsers)

/**
 * @openapi
 * /api/users/{id}:
 *  get:
 *      tags:
 *      - User
 *      summary: Get a user by id
 *      description: Get the user by id from the db
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
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.get("/:id", authMiddleware, checkRol(["admin"]), validatorGetUser, getUser)

/**
 * @openapi
 * /api/users/register:
 *  post:
 *      tags:
 *      - User
 *      summary: User register
 *      description: Register a new user with its own token
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/register"
 *      responses:
 *          '200':
 *              description: Returns the inserted object
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 */
router.post("/register", validatorRegister, registerCtrl)

/**
 * @openapi
 * /api/users/login:
 *  post:
 *      tags:
 *      - User
 *      summary: Login user
 *      description: Login to refresh the user token
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/login"
 *      responses:
 *          '200':
 *              description: Returns the inserted object
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 */
router.post("/login", validatorLogin, loginCtrl) 

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
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put("/:id", authMiddleware, checkUserRol(["admin"]), checkUserId(["admin"]), validatorUpdateUser, updateUser)

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
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.put("/restore/:id", authMiddleware, checkRol(["admin"]), validatorRestoreUser, restoreUser)

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
 *          '403':
 *              description: Validation error
 *          '404':
 *              description: Not found error
 *          '500':
 *              description: Server error
 *      security:
 *          - bearerAuth: []
 */
router.delete("/:id", authMiddleware, checkUserId(["admin"]), validatorDeleteUser, deleteUser)

// Exportamos el router para que pueda ser utilizado en otras partes de la aplicación
module.exports = router