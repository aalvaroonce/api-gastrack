
const axios = require('axios')

const FUEL_STATIONS_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

const convertToFloat = (text) => {
    return parseFloat(text.replace(',', '.'))
}

const haversine = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

const getFuelStationsData = () => {
    return axios.get(FUEL_STATIONS_URL)
}

const converterToFuelStationDto = (fuelStationBase) => {
    return {
      address: fuelStationBase['Dirección'],
      zipCode: fuelStationBase['C.P.'],
      city: fuelStationBase.Localidad,
      municipality: fuelStationBase.Municipio,
      province: fuelStationBase.Provincia,
      latitude: convertToFloat(fuelStationBase.Latitud),
      longitude: convertToFloat(fuelStationBase['Longitud (WGS84)']),
      brand: fuelStationBase['Rótulo'],
      schedule: fuelStationBase.Horario,
      idEESS: fuelStationBase.IDEESS,
      idMunicipality: fuelStationBase.IDMunicipio,
      idProvince: fuelStationBase.IDProvincia,
      idCCAA: fuelStationBase.IDCCAA,
      priceDiesel: convertToFloat(fuelStationBase['Precio Gasoleo A']),
      priceDieselPremium: convertToFloat(fuelStationBase['Precio Gasoleo Premium']),
      pricePetrol95: convertToFloat(fuelStationBase['Precio Gasolina 95 E5']),
      pricePetrol98: convertToFloat(fuelStationBase['Precio Gasolina 98 E5']),
    }
}


module.exports= {haversine, getFuelStationsData, converterToFuelStationDto, convertToFloat}