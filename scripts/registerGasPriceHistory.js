const { gasStationModel } = require('../models');
const { gasPriceHistoryModel } = require('../models');
const { getFuelStationsData, converterToFuelStationDto } = require('../utils/handleMaps');

const registerGasPriceHistory = async () => {
    try {
        const response = await getFuelStationsData();
        const rawStations = response.data.ListaEESSPrecio;

        const savedStations = await gasStationModel.find(); // { saved: true };

        let createdCount = 0;
        let skippedCount = 0;

        for (const saved of savedStations) {
            const match = rawStations.find(s => s.IDEESS === saved.idEESS);

            if (!match) {
                console.error(
                    `⚠️ No se encontró información para la gasolinera con idEESS: ${saved.idEESS}`
                );
                continue;
            }

            const dto = converterToFuelStationDto(match);
            const currentPrices = {
                diesel: dto.priceDiesel,
                dieselPremium: dto.priceDieselPremium,
                petrol95: dto.pricePetrol95,
                petrol95E10: dto.pricePetrol95E10,
                petrol95E5Premium: dto.pricePetrol95E5Premium,
                petrol98: dto.pricePetrol98,
                petrol98E10: dto.pricePetrol98E10,
                gpl: dto.priceGPL,
                biodiesel: dto.priceBiodiesel,
                bioethanol: dto.priceBioethanol,
                gasNaturalLicuado: dto.priceGasNaturalLicuado,
                gasNaturalComprimido: dto.priceGasNaturalComprimido,
                gasoleoB: dto.priceGasoleoB,
                hydrogen: dto.priceHidrogen
            };

            const lastEntry = await gasPriceHistoryModel
                .findOne({ gasStation: saved._id })
                .sort({ createdAt: -1 });

            const hasChanges =
                !lastEntry ||
                Object.keys(currentPrices).some(
                    key => currentPrices[key] !== lastEntry.prices[key]
                );

            if (hasChanges) {
                await gasPriceHistoryModel.create({
                    gasStation: saved._id,
                    prices: currentPrices
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`📊 Historial registrado: ${createdCount} nuevos, ${skippedCount} sin cambios`);
    } catch (error) {
        console.error('❌ Error al registrar historial de precios:', error.message);
    }
};

const startRegisterGasPriceHistory = async () => {
    gasStationIntervalId = setInterval(
        async () => {
            try {
                await registerGasPriceHistory();
            } catch (err) {
                console.error('❌ Error syncing gas stations:', err);
            }
        },
        30 * 60 * 1000 //cada media hora
    );
};

const stopRegisterGasPriceHistory = () => {
    if (gasStationIntervalId) {
        clearInterval(gasStationIntervalId);
    }
};

module.exports = { startRegisterGasPriceHistory, stopRegisterGasPriceHistory };
