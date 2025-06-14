const axios = require('axios');

const FUEL_STATIONS_URL =
    'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

const convertToFloat = text => {
    if (typeof text !== 'string' || text == null) return null;
    const cleaned = text.replace(',', '.').replace(/[^\d.-]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? NaN : value;
};

const haversine = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
};

const getFuelStationsData = () => {
    return axios.get(FUEL_STATIONS_URL);
};

const converterToFuelStationDto = (fuelStationBase, distanceKm = null) => {
    const lat = convertToFloat(fuelStationBase.Latitud);
    const lon = convertToFloat(fuelStationBase['Longitud (WGS84)']);

    return {
        address: fuelStationBase['Dirección'],
        zipCode: fuelStationBase['C.P.'],
        city: fuelStationBase.Localidad,
        municipality: fuelStationBase.Municipio,
        province: fuelStationBase.Provincia,
        latitude: lat,
        longitude: lon,
        location: {
            type: 'Point',
            coordinates: [lon, lat] // Mongo espera [longitud, latitud]
        },
        brand: fuelStationBase['Rótulo'],
        schedule: fuelStationBase.Horario,
        idEESS: fuelStationBase.IDEESS,
        idMunicipality: fuelStationBase.IDMunicipio,
        idProvince: fuelStationBase.IDProvincia,
        idCCAA: fuelStationBase.IDCCAA,
        sellingType: fuelStationBase['Tipo Venta'],
        remission: fuelStationBase['Remisión'],
        margin: fuelStationBase.Margen,
        bioEthanolPct: fuelStationBase['% BioEtanol'],
        methilEster: fuelStationBase['% Éster metílico'],
        priceDiesel: convertToFloat(fuelStationBase['Precio Gasoleo A']),
        priceDieselPremium: convertToFloat(fuelStationBase['Precio Gasoleo Premium']),
        pricePetrol95: convertToFloat(fuelStationBase['Precio Gasolina 95 E5']),
        pricePetrol98: convertToFloat(fuelStationBase['Precio Gasolina 98 E5']),
        priceGPL: convertToFloat(fuelStationBase['Precio Gases licuados del petróleo']),
        priceHidrogen: convertToFloat(fuelStationBase['Precio Hidrogeno']),
        priceBiodiesel: convertToFloat(fuelStationBase['Precio Biodiesel']),
        priceBioethanol: convertToFloat(fuelStationBase['Precio Bioetanol']),
        priceGasNaturalLicuado: convertToFloat(fuelStationBase['Precio Gas Natural Licuado']),
        priceGasNaturalComprimido: convertToFloat(fuelStationBase['Precio Gas Natural Comprimido']),
        pricePetrol95E10: convertToFloat(fuelStationBase['Precio Gasolina 95 E10']),
        pricePetrol95E5Premium: convertToFloat(fuelStationBase['Precio Gasolina 95 E5 Premium']),
        pricePetrol98E10: convertToFloat(fuelStationBase['Precio Gasolina 98 E10']),
        priceGasoleoB: convertToFloat(fuelStationBase['Precio Gasoleo B']),
        distanceKm: distanceKm !== null ? parseFloat(distanceKm.toFixed(2)) : undefined
    };
};

module.exports = { haversine, getFuelStationsData, converterToFuelStationDto, convertToFloat };
