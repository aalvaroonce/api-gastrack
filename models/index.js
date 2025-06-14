// Definimos los modelos con las rutas
const models = {
    userModel: require('./nosql/users'),
    gasStationModel: require('./nosql/gasStation'),
    gasPriceHistoryModel: require('./nosql/gasPriceHistory')
};

// Exportamnos los modelos
module.exports = models;
