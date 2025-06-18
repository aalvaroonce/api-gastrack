const axios = require('axios');

const FUEL_STATIONS_URL =
    'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

const convertToFloat = text => {
    if (typeof text !== 'string' || text == null || text == NaN) return null;
    const cleaned = text.replace(',', '.').replace(/[^\d.-]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? null : value;
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
            coordinates: [lon, lat]
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
        priceAdblue: convertToFloat(fuelStationBase['Precio Adblue']),
        priceAmoniaco: convertToFloat(fuelStationBase['Precio Amoniaco']),
        priceBiodiesel: convertToFloat(fuelStationBase['Precio Biodiesel']),
        priceBioethanol: convertToFloat(fuelStationBase['Precio Bioetanol']),
        priceBiogasNaturalComprimido: convertToFloat(
            fuelStationBase['Precio Biogas Natural Comprimido']
        ),
        priceBiogasNaturalLicuado: convertToFloat(fuelStationBase['Precio Biogas Natural Licuado']),
        priceDieselRenovable: convertToFloat(fuelStationBase['Precio Diésel Renovable']),
        priceGasNaturalComprimido: convertToFloat(fuelStationBase['Precio Gas Natural Comprimido']),
        priceGasNaturalLicuado: convertToFloat(fuelStationBase['Precio Gas Natural Licuado']),
        priceGPL: convertToFloat(fuelStationBase['Precio Gases licuados del petróleo']),
        priceDiesel: convertToFloat(fuelStationBase['Precio Gasoleo A']),
        priceGasoleoB: convertToFloat(fuelStationBase['Precio Gasoleo B']),
        priceDieselPremium: convertToFloat(fuelStationBase['Precio Gasoleo Premium']),
        pricePetrol95E10: convertToFloat(fuelStationBase['Precio Gasolina 95 E10']),
        pricePetrol95E25: convertToFloat(fuelStationBase['Precio Gasolina 95 E25']),
        pricePetrol95: convertToFloat(fuelStationBase['Precio Gasolina 95 E5']),
        pricePetrol95E5Premium: convertToFloat(fuelStationBase['Precio Gasolina 95 E5 Premium']),
        pricePetrol95E85: convertToFloat(fuelStationBase['Precio Gasolina 95 E85']),
        pricePetrol98E10: convertToFloat(fuelStationBase['Precio Gasolina 98 E10']),
        pricePetrol98: convertToFloat(fuelStationBase['Precio Gasolina 98 E5']),
        pricePetrolRenovable: convertToFloat(fuelStationBase['Precio Gasolina Renovable']),
        priceHydrogen: convertToFloat(fuelStationBase['Precio Hidrogeno']),
        priceMethanol: convertToFloat(fuelStationBase['Precio Metanol']),
        distanceKm: distanceKm !== null ? parseFloat(distanceKm.toFixed(2)) : undefined
    };
};

module.exports = { haversine, getFuelStationsData, converterToFuelStationDto, convertToFloat };
