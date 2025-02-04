const {haversine} = require("../utils/handleMaps")
const {convertToFloat, getFuelStationsData, converterToFuelStationDto} = require("../utils/handleMaps")

const fuelStationCoordinates = async (req, res) => {
    const actualLat = parseFloat(req.query.latitude);
    const actualLong = parseFloat(req.query.longitude);

    if (isNaN(actualLat) || isNaN(actualLong)) {
        return res.status(400).send({ message: "Missing or incorrect parameter latitude or longitude" });
    }

    try {
        const response = await getFuelStationsData();
        const fuelStationsList = response.data.ListaEESSPrecio;

        const closerFuelStation = fuelStationsList.reduce((previous, current) => {
            return haversine(actualLat, actualLong, convertToFloat(current.Latitud), convertToFloat(current['Longitud (WGS84)']))
                < haversine(actualLat, actualLong, convertToFloat(previous.Latitud), convertToFloat(previous['Longitud (WGS84)']))
                ? current
                : previous;
        });

        res.status(200).send(converterToFuelStationDto(closerFuelStation));
    } catch (error) {
        res.status(500).send({ message: "Error retrieving fuel stations", error: error.message });
    }
}

const getFuelStationsByIds = (fuelStationsIds, res) => {
    if (!fuelStationsIds) {
        return res.status(500).send({ error: "Incorrect parameter. Expecting route param or body param fuelStationIds" })
    }

    getFuelStationsData()
        .then(response => {
            const fuelStationsList = response.data.ListaEESSPrecio;
            const filteredFuelStations = fuelStationsList.filter(fuelStation => fuelStationsIds.includes(fuelStation.IDEESS));

            if (filteredFuelStations.length) {
                return res.send(filteredFuelStations.map(fuelStation => converterToFuelStationDto(fuelStation)));
            }

            res.status(404).send({ error: "Fuel station ID not found"})
        })
        .catch(error => {
            res.status(500).send({ error: `Error retrieving fuel stations: ${error.message}`})

        });
}

module.exports= { fuelStationCoordinates, getFuelStationsByIds }