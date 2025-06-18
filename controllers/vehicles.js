const { matchedData } = require('express-validator');
const { userModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');
const mongoose = require('mongoose');
const { uploadToPinata } = require('../utils/handleUploadIPFS');

// Agregar un vehículo
const addVehicle = async (req, res) => {
    try {
        const userId = req.user._id;
        const newVehicle = matchedData(req);

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send('USER_NOT_FOUND');

        newVehicle._id = new mongoose.Types.ObjectId();
        user.vehicles.push(newVehicle);
        await user.save();

        res.status(201).send('VEHICLE_ADDED');
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_ADDING_VEHICLE', err);
    }
};

// Actualizar un vehículo por su ID
const updateVehicle = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id, ...updatedVehicle } = matchedData(req);

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send('USER_NOT_FOUND');

        const vehicle = user.vehicles.id(id);
        if (!vehicle) return res.status(404).send('VEHICLE_NOT_FOUND');

        Object.assign(vehicle, updatedVehicle);
        await user.save();

        res.status(200).send(user.vehicles);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_UPDATING_VEHICLE', err);
    }
};

// Eliminar un vehículo por su ID
const deleteVehicle = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: vehicleId } = matchedData(req);

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send('USER_NOT_FOUND');

        const vehicle = user.vehicles.id(vehicleId);
        if (!vehicle) return res.status(404).send('VEHICLE_NOT_FOUND');

        if (vehicle.urlToVehicle) {
            const parts = vehicle.urlToVehicle.split('/ipfs/');
            if (parts.length === 2) {
                const ipfsHash = parts[1];
                await deleteFromPinata(ipfsHash).catch(() => {});
            }
        }

        vehicle.deleteOne();
        await user.save();

        res.status(200).send('VEHICLE_DELETED');
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_DELETING_VEHICLE');
    }
};

// Añadir imagen de vehículo
const addImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: vehicleId } = matchedData(req);
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send('USER_NOT_FOUND');

        const vehicle = user.vehicles.id(vehicleId);
        if (!vehicle) return res.status(404).send('VEHICLE_NOT_FOUND');

        if (vehicle.urlToVehicle) {
            const parts = vehicle.urlToVehicle.split('/ipfs/');
            if (parts.length === 2) {
                const previousHash = parts[1];
                await deleteFromPinata(previousHash).catch(() => {});
            }
        }

        const pinataResponse = await uploadToPinata(fileBuffer, fileName, userId);
        const ipfsHash = pinataResponse.IpfsHash;
        const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;

        vehicle.urlToVehicle = ipfsUrl;
        await user.save();

        res.status(200).send('VEHICLE_IMAGE_UPDATED');
    } catch (err) {
        console.error(err);
        res.status(500).send('ERROR_ADDING_IMAGE_TO_VEHICLE');
    }
};

module.exports = {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addImage
};
