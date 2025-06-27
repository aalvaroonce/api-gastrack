const {
    userModel,
    gasStationModel,
    gasPriceHistoryModel,
    notificationsModel
} = require('../models');
const { setNotification } = require('../controllers/notifications');
const {
    calculateAveragePrice,
    getCurrentPrice,
    isPriceSignificantlyLower,
    getUserPreferredFuelTypes,
    sendPushToUser,
    formatPrice,
    getFuelDisplayName
} = require('../utils/handleLowPriceNotifications');
let priceNotificationIntervalId = null;

// Verifica precios bajos y envía notificaciones
const checkLowPricesAndNotify = async () => {
    try {
        console.log('🔍 Iniciando verificación de precios bajos...');

        const users = await userModel
            .find({
                gasStatations: { $exists: true, $not: { $size: 0 } }
            })
            .populate('gasStatations');

        let notificationsSent = 0;

        for (const user of users) {
            const preferredFuelTypes = getUserPreferredFuelTypes(user);

            for (const gasStation of user.gasStatations) {
                try {
                    const priceHistory = await gasPriceHistoryModel
                        .find({ gasStation: gasStation._id })
                        .sort({ date: -1 })
                        .limit(100); // Últimas 100 entradas

                    if (priceHistory.length < 5) continue;

                    for (const fuelType of preferredFuelTypes) {
                        const currentPrice = getCurrentPrice(gasStation._id, fuelType);
                        const averagePrice = calculateAveragePrice(priceHistory, fuelType);

                        if (isPriceSignificantlyLower(await currentPrice, averagePrice, fuelType)) {
                            const savings = averagePrice - (await currentPrice);
                            const title = '⛽ ¡Precio bajo detectado!';
                            const message = `${getFuelDisplayName(fuelType)} en ${gasStation.brand} (${gasStation.address}) está a ${formatPrice(await currentPrice)}. ¡Ahorras ${formatPrice(savings)}!`;

                            const recentNotification = await notificationsModel.findOne({
                                user: user._id,
                                message: { $regex: gasStation.idEESS },
                                createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
                            });

                            if (!recentNotification) {
                                await sendPushToUser(user, title, message);
                                await setNotification(user._id, title, message, 'info');
                                notificationsSent++;
                            }
                        }
                    }
                } catch (stationError) {
                    console.error(
                        `Error procesando gasolinera ${gasStation.idEESS}:`,
                        stationError
                    );
                }
            }
        }

        console.log(`📊 Verificación completada. ${notificationsSent} notificaciones enviadas.`);
    } catch (error) {
        console.error('❌ Error en verificación de precios bajos:', error);
    }
};

// Inicia el sistema de notificaciones de precios bajos
const startLowPriceNotifications = () => {
    console.log('🚀 Iniciando sistema de notificaciones de precios bajos...');

    checkLowPricesAndNotify();

    priceNotificationIntervalId = setInterval(
        checkLowPricesAndNotify,
        2 * 60 * 60 * 1000 // 2 horas
    );

    console.log('⏰ Sistema programado para ejecutarse cada 2 horas');
};

// Detiene el sistema de notificaciones de precios bajos
const stopLowPriceNotifications = () => {
    if (priceNotificationIntervalId) {
        clearInterval(priceNotificationIntervalId);
        priceNotificationIntervalId = null;
    }
};

// Función para probar el sistema manualmente con un usuario específico
const testNotificationForUser = async userEmail => {
    try {
        const user = await userModel.findOne({ email: userEmail }).populate('gasStatations');
        if (!user) {
            console.log('Usuario no encontrado');
            return;
        }

        console.log(`🧪 Probando notificaciones para ${user.email}`);
        const preferredFuelTypes = getUserPreferredFuelTypes(user);
        console.log(`Combustibles preferidos: ${preferredFuelTypes.join(', ')}`);

        // Simular el proceso para este usuario específico
        // ... (lógica similar a checkLowPricesAndNotify pero solo para este usuario)
    } catch (error) {
        console.error('Error en prueba:', error);
    }
};

module.exports = {
    startLowPriceNotifications,
    stopLowPriceNotifications,
    checkLowPricesAndNotify,
    testNotificationForUser
};
