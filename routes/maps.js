const express = require('express');
const router = express.Router();
const {
    fuelStationCoordinates,
    getFuelStationById,
    getFuelStationsByIds
} = require('../controllers/maps.js');

/**
 * @openapi
 * /api/fuelStationCoordinates:
 *  get:
 *      tags:
 *      - Fuel Stations
 *      summary: Get the nearest fuel station
 *      description: Returns the closest fuel station based on the given latitude and longitude
 *      parameters:
 *          - name: latitude
 *            in: query
 *            required: true
 *            schema:
 *                type: number
 *          - name: longitude
 *            in: query
 *            required: true
 *            schema:
 *                type: number
 *      responses:
 *          '200':
 *              description: Returns the nearest fuel station
 *          '400':
 *              description: Missing or incorrect parameters
 *          '500':
 *              description: Server error
 */
router.get('/fuelStationCoordinates', fuelStationCoordinates);

/**
 * @openapi
 * /api/fuelStationId/{id}:
 *  get:
 *      tags:
 *      - Fuel Stations
 *      summary: Get fuel station by ID
 *      description: Returns fuel station details based on the given ID
 *      parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          '200':
 *              description: Returns fuel station details
 *          '404':
 *              description: Fuel station ID not found
 *          '500':
 *              description: Server error
 */
router.get('/fuelStationId/:id', getFuelStationById);

/**
 * @openapi
 * /api/fuelStationId:
 *  post:
 *      tags:
 *      - Fuel Stations
 *      summary: Get multiple fuel stations by ID
 *      description: Returns details for multiple fuel stations based on IDs provided in the request body or query
 *      requestBody:
 *          required: false
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          fuelStationIds:
 *                              type: array
 *                              items:
 *                                  type: string
 *      parameters:
 *          - name: fuelStationIds
 *            in: query
 *            required: false
 *            schema:
 *                type: string
 *      responses:
 *          '200':
 *              description: Returns fuel station details
 *          '404':
 *              description: Fuel station ID not found
 *          '500':
 *              description: Server error
 */
router.post('/fuelStationId', (req, res) => {
    const bodyIds = req.body.fuelStationIds?.map(id => id.toString());
    const paramIds = JSON.parse(req.query.fuelStationIds ?? 'null')?.map(id => id.toString());

    const ids = bodyIds ?? paramIds;
    getFuelStationsByIds(ids, res);
});

module.exports = router;
