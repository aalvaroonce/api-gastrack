const express = require('express');
const {
    getNotification,
    getNotifications,
    updateNotificationStatus,
    deleteNotification
} = require('../controllers/notifications');

const {
    validatorGetNotification,
    validatorUpdateNotificationStatus,
    validatorDeleteNotification
} = require('../validators/notifications');

const authMiddleware = require('../middleware/session');

const router = express.Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Obtener todas las notificaciones de un usuario
 *     responses:
 *       '200':
 *         description: Notificaciones obtenidas correctamente
 *       '404':
 *         description: No hay notificaciones aún
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, getNotifications);

/**
 * @openapi
 * /api/notifications/{id}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Obtener una notificación por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la notificación
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notificación obtenida correctamente
 *       '404':
 *         description: Notificación no encontrada
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, validatorGetNotification, getNotification);

/**
 * @openapi
 * /api/notifications/{id}:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Actualizar el estado de una notificación
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la notificación a actualizar
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 description: Nuevo estado de la notificación
 *     responses:
 *       '200':
 *         description: Notificación actualizada correctamente
 *       '404':
 *         description: Notificación no encontrada
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authMiddleware, validatorUpdateNotificationStatus, updateNotificationStatus);

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Eliminar una notificación por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la notificación a eliminar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notificación eliminada correctamente
 *       '404':
 *         description: No se encontró la notificación
 *       '500':
 *         description: Error en el servidor
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, validatorDeleteNotification, deleteNotification);

module.exports = router;
