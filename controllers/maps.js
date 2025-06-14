const {
    convertToFloat,
    getFuelStationsData,
    converterToFuelStationDto,
    haversine
} = require('../utils/handleMaps');
const { gasStationModel, gasPriceHistoryModel } = require('../models');

const fuelStationCoordinates = async (req, res) => {
    try {
        const actualLat = parseFloat(req.query.latitude);
        const actualLong = parseFloat(req.query.longitude);
        const radius = parseFloat(req.query.radius) || 5; // km
        const limit = parseInt(req.query.limit) || null;
        const fuelType = req.query.fuelType;
        const brand = req.query.brand;

        if (isNaN(actualLat) || isNaN(actualLong)) {
            return res
                .status(400)
                .send({ message: 'Missing or incorrect parameter latitude or longitude' });
        }

        const radiusInMeters = radius * 1000;

        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [actualLong, actualLat]
                    },
                    distanceField: 'distance',
                    spherical: true,
                    maxDistance: radiusInMeters,
                    query: brand ? { brand: brand.toUpperCase() } : {}
                }
            },
            ...(limit ? [{ $limit: limit }] : [])
        ];

        const gasStations = await gasStationModel.aggregate(pipeline);

        if (gasStations.length === 0) {
            return res.status(404).send({ message: 'No gas stations found in radius' });
        }

        const stationIds = gasStations.map(gs => gs._id);

        const priceDocs = await gasPriceHistoryModel.aggregate([
            { $match: { gasStation: { $in: stationIds } } },
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: '$gasStation',
                    latestPrices: { $first: '$prices' },
                    latestDate: { $first: '$date' }
                }
            }
        ]);

        const pricesMap = new Map(priceDocs.map(doc => [doc._id.toString(), doc]));

        const results = gasStations
            .map(gs => {
                const priceEntry = pricesMap.get(gs._id.toString());
                if (!priceEntry) return null;

                const price = fuelType
                    ? priceEntry.latestPrices[fuelType]
                    : priceEntry.latestPrices;

                if (fuelType && (price === null || price === undefined)) return null;

                return {
                    id: gs.idEESS,
                    brand: gs.brand,
                    address: gs.address,
                    location: gs.location.coordinates,
                    distance: Number((gs.distance / 1000).toFixed(2)), // convertir a km
                    fuelType: fuelType || 'all',
                    price,
                    lastUpdated: priceEntry.latestDate
                };
            })
            .filter(Boolean);

        return res.status(200).send(results);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: 'Error retrieving fuel stations', error: error.message });
    }
};

const getFuelStationById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({ error: 'Missing fuel station ID in route params' });
    }

    try {
        const response = await getFuelStationsData();
        const fuelStationsList = response.data.ListaEESSPrecio;

        const fuelStation = fuelStationsList.find(fs => fs.IDEESS === id);

        if (!fuelStation) {
            return res.status(404).send({ error: 'Fuel station ID not found' });
        }

        res.status(200).send(converterToFuelStationDto(fuelStation));
    } catch (error) {
        res.status(500).send({ error: `Error retrieving fuel station: ${error.message}` });
    }
};

const getFuelStationsByIds = async (ids, res) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({
            error: 'Missing or incorrect parameter fuelStationIds. Expecting an array of IDs.'
        });
    }

    try {
        const response = await getFuelStationsData();
        const fuelStationsList = response.data.ListaEESSPrecio;

        const filteredFuelStations = fuelStationsList.filter(fuelStation =>
            ids.includes(fuelStation.IDEESS)
        );

        if (!filteredFuelStations.length) {
            return res.status(404).send({ error: 'Fuel station IDs not found' });
        }

        res.send(filteredFuelStations.map(converterToFuelStationDto));
    } catch (error) {
        res.status(500).send({ error: `Error retrieving fuel stations: ${error.message}` });
    }
};

module.exports = {
    fuelStationCoordinates,
    getFuelStationById,
    getFuelStationsByIds
};
