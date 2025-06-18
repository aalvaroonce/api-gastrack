const { matchedData } = require('express-validator');
const { userModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');
const mongoose = require('mongoose');

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
        const { id } = matchedData(req);

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).send('USER_NOT_FOUND');

        const vehicle = user.vehicles.id(id);
        if (!vehicle) return res.status(404).send('VEHICLE_NOT_FOUND');

        vehicle.deleteOne();
        await user.save();

        res.status(200).send('VEHICLE_DELETED');
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_DELETING_VEHICLE', err);
    }
};

module.exports = {
    addVehicle,
    updateVehicle,
    deleteVehicle
};
