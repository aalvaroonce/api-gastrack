const {
    convertToFloat,
    getFuelStationsData,
    converterToFuelStationDto,
    haversine
} = require('../utils/handleMaps');
const { gasStationModel, gasPriceHistoryModel } = require('../models');
const moment = require('moment');

const fuelTypeKeys = {
    diesel: 'priceDiesel',
    dieselPremium: 'priceDieselPremium',
    dieselRenovable: 'priceDieselRenovable',
    petrol95: 'pricePetrol95',
    petrol95E10: 'pricePetrol95E10',
    petrol95E25: 'pricePetrol95E25',
    petrol95E5Premium: 'pricePetrol95E5Premium',
    petrol95E85: 'pricePetrol95E85',
    petrol98: 'pricePetrol98',
    petrol98E10: 'pricePetrol98E10',
    petrolRenovable: 'pricePetrolRenovable',
    gpl: 'priceGPL',
    biodiesel: 'priceBiodiesel',
    bioethanol: 'priceBioethanol',
    biogasNaturalComprimido: 'priceBiogasNaturalComprimido',
    biogasNaturalLicuado: 'priceBiogasNaturalLicuado',
    gasNaturalComprimido: 'priceGasNaturalComprimido',
    gasNaturalLicuado: 'priceGasNaturalLicuado',
    gasoleoB: 'priceGasoleoB',
    hydrogen: 'priceHydrogen',
    methanol: 'priceMethanol',
    adblue: 'priceAdblue',
    amoniaco: 'priceAmoniaco'
};

const fuelStationCoordinates = async (req, res) => {
    try {
        const actualLat = parseFloat(req.query.latitude);
        const actualLong = parseFloat(req.query.longitude);
        const radius = parseFloat(req.query.radius) || 5;
        const limit = parseInt(req.query.limit) || null;
        const fuelType = req.query.fuelType || null;
        const brand = req.query.brand || null;
        const availability = req.query.availability || 'all'; // open | closed | all
        const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;

        if (isNaN(actualLat) || isNaN(actualLong)) {
            return res.status(400).send('Missing or incorrect parameter latitude or longitude');
        }

        const isValidFuelType = fuelType && Object.keys(fuelTypeKeys).includes(fuelType);
        const radiusInMeters = radius * 1000;

        const baseQuery = {};
        if (brand) baseQuery.brand = brand.toUpperCase();
        if (minRating) baseQuery['reviews.scoring'] = { $gte: minRating };

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
                    query: baseQuery
                }
            }
        ];

        if (limit) {
            pipeline.push({ $limit: limit });
        }

        let gasStations = await gasStationModel.aggregate(pipeline);

        // Filtro de disponibilidad (open/closed)
        if (availability !== 'all') {
            const isOpenNow = schedule => {
                if (!schedule || typeof schedule !== 'string') return false;
                const now = moment();
                const dayOfWeek = now.isoWeekday();

                const parts = schedule.split(';');
                for (let part of parts) {
                    const [daysStr, hoursStr] = part.split(':').map(s => s.trim());
                    if (!daysStr || !hoursStr) continue;

                    const dayMap = {
                        L: 1,
                        M: 2,
                        X: 3,
                        J: 4,
                        V: 5,
                        S: 6,
                        D: 7
                    };

                    let daysRange = [];
                    const days = daysStr.split('-').map(d => d.trim());
                    if (days.length === 1) {
                        daysRange = [dayMap[days[0]]];
                    } else if (days.length === 2) {
                        const start = dayMap[days[0]];
                        const end = dayMap[days[1]];
                        for (let i = start; i <= end; i++) daysRange.push(i);
                    }

                    if (daysRange.includes(dayOfWeek)) {
                        const [startTime, endTime] = hoursStr.split('-');
                        const start = moment(startTime, 'HH:mm');
                        const end = moment(endTime, 'HH:mm');
                        if (now.isBetween(start, end)) return true;
                    }
                }
                return false;
            };

            gasStations = gasStations.filter(gs =>
                availability === 'closed' ? isOpenNow(gs.schedule) : !isOpenNow(gs.schedule)
            );
        }

        if (gasStations.length === 0) {
            return res.status(404).send('NO_GASSTATIONS_FOUND');
        }

        const response = await getFuelStationsData();
        const allFuelStationsRaw = response.data.ListaEESSPrecio;

        const priceMap = new Map();
        for (const rawStation of allFuelStationsRaw) {
            const dto = converterToFuelStationDto(rawStation);
            priceMap.set(dto.idEESS, dto);
        }

        const results = gasStations
            .map(gs => {
                const priceEntry = priceMap.get(gs.idEESS);
                if (!priceEntry) return null;

                if (isValidFuelType) {
                    const field = fuelTypeKeys[fuelType];
                    const price = priceEntry[field];
                    if (price === null || price === undefined || isNaN(price)) return null;

                    return {
                        id: gs.idEESS,
                        brand: gs.brand,
                        address: gs.address,
                        location: gs.location.coordinates,
                        distance: Number((gs.distance / 1000).toFixed(2)),
                        fuelType,
                        price,
                        lastUpdated: new Date(),
                        rating: gs.reviews?.scoring ?? 0
                    };
                } else {
                    const allPrices = {};
                    for (const key of Object.keys(fuelTypeKeys)) {
                        const field = fuelTypeKeys[key];
                        allPrices[key] = priceEntry[field];
                    }

                    return {
                        id: gs.idEESS,
                        brand: gs.brand,
                        address: gs.address,
                        location: gs.location.coordinates,
                        distance: Number((gs.distance / 1000).toFixed(2)),
                        fuelType: 'all',
                        prices: allPrices,
                        lastUpdated: new Date(),
                        rating: gs.reviews?.scoring ?? 0
                    };
                }
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

    const { from, to } = req.query;

    try {
        const gasStation = await gasStationModel.findOne({ idEESS: id });
        if (!gasStation) {
            return res.status(404).send({ error: 'Fuel station not found in database' });
        }

        const response = await getFuelStationsData();
        const fuelStationsList = response.data.ListaEESSPrecio;
        const fuelStation = fuelStationsList.find(fs => fs.IDEESS === id);

        if (!fuelStation) {
            return res.status(404).send({ error: 'Fuel station ID not found in external data' });
        }

        const currentData = converterToFuelStationDto(fuelStation);

        const historyQuery = { gasStation: gasStation._id };
        if (from || to) {
            historyQuery.date = {};
            if (from) historyQuery.date.$gte = new Date(from);
            if (to) historyQuery.date.$lte = new Date(to);
        }

        const priceHistory = await gasPriceHistoryModel
            .find(historyQuery)
            .sort({ date: 1 }) // Ordenar cronológicamente
            .lean();

        return res.status(200).send({
            station: {
                idEESS: id,
                ...gasStation.toObject(),
                currentPrices: currentData
            },
            priceHistory
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: `Error retrieving fuel station: ${error.message}` });
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
