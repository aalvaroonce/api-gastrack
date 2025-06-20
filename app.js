// Importamos express
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger.js');
const cors = require('cors');
const dbConnect = require('./config/mongo.js');
const { startSyncGasStations } = require('./scripts/syncGasStations.js');
const { startRegisterGasPriceHistory } = require('./scripts/registerGasPriceHistory.js');
const apiLimiter = require('./middleware/rate-limiter.js');

require('dotenv').config();
const app = express();
app.set('trust proxy', 1);
app.use(cors());

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/', apiLimiter);
app.use('/api', require('./routes'));

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
    dbConnect();
});

startSyncGasStations();
startRegisterGasPriceHistory();

module.exports = app;
