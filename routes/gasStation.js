const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const {
    saveGasStationToFavorites,
    removeGasStationFromFavorites,
    addOrUpdateReview,
    deleteReview,
    getGasStationWithHistory
} = require('../controllers/gasStation');
const { validatorIdEESS, validatorReview } = require('../validators/gasStation');

/**
 * @openapi
 * /api/gasstations/favorite:
 *   post:
 *     tags:
 *       - Gas Station
 *     summary: Añadir gasolinera a favoritos
 *     description: Permite a un usuario guardar una gasolinera como favorita
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEESS]
 *             properties:
 *               idEESS:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Gasolinera añadida a favoritos
 *       404:
 *         description: Gasolinera no encontrada
 *     security:
 *       - bearerAuth: []
 */
router.post('/favorite', authMiddleware, validatorIdEESS, saveGasStationToFavorites);

/**
 * @openapi
 * /api/gasstations/favorite:
 *   delete:
 *     tags:
 *       - Gas Station
 *     summary: Eliminar gasolinera de favoritos
 *     description: Permite a un usuario quitar una gasolinera de sus favoritas
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEESS]
 *             properties:
 *               idEESS:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasolinera eliminada de favoritos
 *       404:
 *         description: Gasolinera no encontrada
 *     security:
 *       - bearerAuth: []
 */
router.delete('/favorite', authMiddleware, validatorIdEESS, removeGasStationFromFavorites);

/**
 * @openapi
 * /api/gasstations/review:
 *   post:
 *     tags:
 *       - Gas Station
 *     summary: Añadir o actualizar reseña
 *     description: Permite a un usuario escribir o actualizar una reseña sobre una gasolinera
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEESS, rating]
 *             properties:
 *               idEESS:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña guardada o actualizada
 *     security:
 *       - bearerAuth: []
 */
router.post('/review', authMiddleware, validatorReview, addOrUpdateReview);

/**
 * @openapi
 * /api/gasstations/review:
 *   delete:
 *     tags:
 *       - Gas Station
 *     summary: Eliminar reseña de una gasolinera
 *     description: Elimina la reseña que el usuario actual haya escrito sobre una gasolinera
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEESS]
 *             properties:
 *               idEESS:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña eliminada
 *     security:
 *       - bearerAuth: []
 */
router.delete('/review', authMiddleware, validatorIdEESS, deleteReview);

/**
 * @openapi
 * /api/gasstations/{idEESS}:
 *   get:
 *     tags:
 *       - Gas Station
 *     summary: Obtener gasolinera con historial de precios
 *     description: Devuelve la información de la gasolinera junto a su historial de precios
 *     parameters:
 *       - name: idEESS
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Información y precios históricos de la gasolinera
 *       404:
 *         description: Gasolinera no encontrada
 */
router.get('/:idEESS', authMiddleware, validatorIdEESS, getGasStationWithHistory);

module.exports = router;
