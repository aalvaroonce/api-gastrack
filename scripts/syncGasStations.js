require('dotenv').config();
const { getFuelStationsData, converterToFuelStationDto } = require('../utils/handleMaps');
const { gasStationModel } = require('../models');
let gasStationIntervalId = null;

const hasGasStationChanged = (existing, incoming) => {
    const keysToCompare = [
        'latitude',
        'longitude',
        'address',
        'zipCode',
        'city',
        'municipality',
        'province',
        'schedule',
        'brand',
        'idMunicipality',
        'idProvince',
        'idCCAA',
        'sellingType',
        'remission',
        'margin',
        'bioEthanolPct',
        'methilEster'
    ];

    return keysToCompare.some(key => {
        const existingValue = existing[key]?.toString() || '';
        const incomingValue = incoming[key]?.toString() || '';
        return existingValue !== incomingValue;
    });
};

const syncGasStations = async () => {
    try {
        const response = await getFuelStationsData();
        const rawStations = response.data.ListaEESSPrecio;

        let newCount = 0;
        let updatedCount = 0;

        for (const station of rawStations) {
            const dto = converterToFuelStationDto(station);
            const existing = await gasStationModel.findOne({ idEESS: dto.idEESS });

            if (!existing) {
                await gasStationModel.create(dto);
                newCount++;
            } else if (hasGasStationChanged(existing.toObject(), dto)) {
                await gasStationModel.updateOne({ _id: existing._id }, dto);
                updatedCount++;
            }
        }
        await gasStationModel.syncIndexes();

        console.log(`✅ Sync finished: ${newCount} new, ${updatedCount} updated`);
    } catch (err) {
        console.error('❌ Error syncing gas stations:', err.message);
    }
};

const startSyncGasStations = async () => {
    gasStationIntervalId = setInterval(
        async () => {
            try {
                console.log('Sync gas stations started');
                await syncGasStations();
            } catch (err) {
                console.error('❌ Error syncing gas stations:', err);
            }
        },
        24 * 60 * 60 * 1000
    );
};

const stopSyncGasStations = () => {
    if (gasStationIntervalId) {
        clearInterval(gasStationIntervalId);
    }
};

module.exports = { startSyncGasStations, stopSyncGasStations };
