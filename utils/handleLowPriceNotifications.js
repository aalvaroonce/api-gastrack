const { gasPriceHistoryModel } = require('../models');
// const sendPushNotification = require('../utils/handleNotifications');

// Configuración de umbrales de descuento por tipo de combustible
const FUEL_THRESHOLDS = {
    diesel: 0.05,
    dieselPremium: 0.05,
    petrol95: 0.05,
    petrol95E10: 0.05,
    petrol98: 0.06,
    petrol95E5Premium: 0.06,
    petrol98E10: 0.06,
    gpl: 0.03,
    biodiesel: 0.04,
    bioethanol: 0.04,
    gasNaturalLicuado: 0.08,
    gasNaturalComprimido: 0.08,
    hydrogen: 0.2
};

// Días para calcular el promedio histórico
const DAYS_FOR_AVERAGE = 15;

// Calcula el precio promedio de un combustible en los últimos días
const calculateAveragePrice = (priceHistory, fuelType, days = DAYS_FOR_AVERAGE) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantPrices = priceHistory
        .filter(
            entry =>
                entry.date >= cutoffDate && entry.prices[fuelType] && entry.prices[fuelType] > 0
        )
        .map(entry => entry.prices[fuelType]);

    if (relevantPrices.length === 0) return null;

    return relevantPrices.reduce((sum, price) => sum + price, 0) / relevantPrices.length;
};

// Obtiene el precio actual de una gasolinera para un tipo de combustible
const getCurrentPrice = async (gasStationId, fuelType) => {
    try {
        const latestPrice = await gasPriceHistoryModel
            .findOne({ gasStation: gasStationId })
            .sort({ date: -1 });

        return latestPrice?.prices?.[fuelType] || null;
    } catch (error) {
        console.error(`Error obteniendo precio actual:`, error);
        return null;
    }
};

// Verifica si un precio está significativamente más bajo que el promedio
const isPriceSignificantlyLower = (currentPrice, averagePrice, fuelType) => {
    if (!currentPrice || !averagePrice) return false;

    const threshold = FUEL_THRESHOLDS[fuelType] || 0.05;
    const difference = averagePrice - currentPrice;

    return difference >= threshold;
};

// Obtiene el tipo de combustible preferido del usuario basado en sus vehículos
const getUserPreferredFuelTypes = user => {
    if (!user.vehicles || user.vehicles.length === 0) {
        return ['diesel', 'petrol95', 'petrol98'];
    }

    const fuelTypes = user.vehicles
        .map(vehicle => vehicle.fuelType?.fuelType || vehicle.fuelType)
        .filter(Boolean);

    return fuelTypes.length > 0 ? [...new Set(fuelTypes)] : ['diesel', 'petrol95'];
};

// Envía notificación push al usuario
const sendPushToUser = async (user, title, message) => {
    try {
        if (user.notifications && user.token) {
            // await sendPushNotification(user.token, title, message);
            console.log(`📱 Push enviado a ${user.email}: ${title}`);
        }
    } catch (error) {
        console.error(`Error enviando push a ${user.email}:`, error);
    }
};

// Formatea el precio para mostrar
const formatPrice = price => {
    return price.toFixed(3) + '€/L';
};

// Obtiene el nombre legible del combustible
const getFuelDisplayName = fuelType => {
    const names = {
        diesel: 'Diesel',
        dieselPremium: 'Diesel Premium',
        petrol95: 'Gasolina 95',
        petrol95E10: 'Gasolina 95 E10',
        petrol98: 'Gasolina 98',
        petrol95E5Premium: 'Gasolina 95 Premium',
        gpl: 'GPL',
        biodiesel: 'Biodiesel',
        bioethanol: 'Bioetanol',
        gasNaturalLicuado: 'Gas Natural',
        hydrogen: 'Hidrógeno'
    };
    return names[fuelType] || fuelType;
};

module.exports = {
    calculateAveragePrice,
    getCurrentPrice,
    isPriceSignificantlyLower,
    getUserPreferredFuelTypes,
    sendPushToUser,
    formatPrice,
    getFuelDisplayName
};
