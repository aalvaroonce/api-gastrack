const {
    convertToFloat,
    getFuelStationsData,
    converterToFuelStationDto,
    haversine
} = require('../utils/handleMaps');

const fuelStationCoordinates = async (req, res) => {
    const actualLat = parseFloat(req.query.latitude);
    const actualLong = parseFloat(req.query.longitude);
    const radius = parseFloat(req.query.radius) || 5; // en kilómetros
    const limit = parseInt(req.query.limit) || null;

    if (isNaN(actualLat) || isNaN(actualLong)) {
        return res.status(400).send({
            message: 'Missing or incorrect parameter latitude or longitude'
        });
    }

    try {
        const response = await getFuelStationsData();
        const fuelStationsList = response.data.ListaEESSPrecio;

        // Calcular distancia y filtrar por radio
        const fuelStationsWithinRadius = fuelStationsList
            .map(station => {
                const lat = convertToFloat(station.Latitud);
                const lon = convertToFloat(station['Longitud (WGS84)']);
                if (isNaN(lat) || isNaN(lon)) return null;

                const distance = haversine(actualLat, actualLong, lat, lon);
                return { ...station, distance };
            })
            .filter(station => station && station.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

        const limitedResults = limit
            ? fuelStationsWithinRadius.slice(0, limit)
            : fuelStationsWithinRadius;

        const formattedResults = limitedResults.map(fs =>
            converterToFuelStationDto(fs, fs.distance)
        );

        console.log(`Found ${formattedResults.length} fuel stations within ${radius}km`);

        res.status(200).send(formattedResults);
    } catch (error) {
        res.status(500).send({
            message: 'Error retrieving fuel stations',
            error: error.message
        });
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
