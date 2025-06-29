const express = require('express');
const {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addImage,
    toggleDefaultVehicle
} = require('../controllers/vehicles');
const authMiddleware = require('../middleware/session');
const {
    validatorAddVehicle,
    validatorUpdateVehicle,
    validatorDelete
} = require('../validators/vehicles');
const { validatorId } = require('../validators/users');
const { uploadMiddlewareMemory } = require('../utils/handleStorage');

const router = express.Router();

/**
 * @openapi
 * /api/vehicles:
 *   post:
 *     tags:
 *       - Vehicle
 *     summary: Agrega un nuevo vehículo al usuario autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/vehicleInput'
 *     responses:
 *       201:
 *         description: Vehículo agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: VEHICLE_ADDED
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, validatorAddVehicle, addVehicle);

/**
 * @openapi
 * /api/vehicles/{id}/image:
 *   post:
 *     tags:
 *       - Vehicle
 *     summary: Cambia el vehiculo en default
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del vehículo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen agregada exitosamente
 *       404:
 *         description: Usuario o vehículo no encontrado
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch('/toggleDefault', authMiddleware, validatorId, toggleDefaultVehicle);

/**
 * @openapi
 * /api/vehicles/{id}/image:
 *   post:
 *     tags:
 *       - Vehicle
 *     summary: Sube o reemplaza una imagen del vehículo
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del vehículo
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: VEHICLE_IMAGE_UPDATED
 *                 url:
 *                   type: string
 *                   example: https://gateway.pinata.cloud/ipfs/Qm...
 *       404:
 *         description: Usuario o vehículo no encontrado
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/:id/image',
    authMiddleware,
    validatorId,
    uploadMiddlewareMemory.single('image'),
    addImage
);

/**
 * @openapi
 * /api/vehicles/{id}:
 *   put:
 *     tags:
 *       - Vehicle
 *     summary: Actualiza un vehículo del usuario autenticado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del vehículo a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/vehicleInput'
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: VEHICLE_UPDATED
 *       404:
 *         description: Usuario o vehículo no encontrado
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, validatorUpdateVehicle, updateVehicle);

/**
 * @openapi
 * /api/vehicles/{id}:
 *   delete:
 *     tags:
 *       - Vehicle
 *     summary: Elimina un vehículo del usuario autenticado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del vehículo a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: VEHICLE_DELETED
 *       404:
 *         description: Usuario o vehículo no encontrado
 *       500:
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, validatorDelete, deleteVehicle);

module.exports = router;
