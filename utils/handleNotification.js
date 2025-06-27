const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

/**
 * Envía una notificación push a un dispositivo con FCM
 * @param {string} token - El token FCM del dispositivo
 * @param {Object} data - El contenido de la notificación
 * @param {string} data.title - Título de la notificación
 * @param {string} data.body - Cuerpo de la notificación
 * @param {Object} [data.extraData] - (Opcional) Datos adicionales que quieras mandar
 */
const sendPushNotification = async (token, { title, body, extraData = {} }) => {
    const message = {
        token,
        notification: {
            title,
            body
        },
        data: {
            ...extraData
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notificación enviada:', response);
        return response;
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
        throw error;
    }
};

module.exports = sendPushNotification;
