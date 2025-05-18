const { matchedData } = require('express-validator');
const { gasStationModel, userModel, priceHistoryModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');

// Guardar gasolinera como favorita
const saveGasStationToFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send({ message: 'Gasolinera no encontrada' });

        const updatedUser = await userModel.updateOne(
            { _id: userId },
            { $addToSet: { gasStatations: { gasStation: station._id } } },
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (err) {
        handleHttpError(res, 'ERROR_SAVING_GASSTATION');
    }
};

// Eliminar gasolinera de favoritos
const removeGasStationFromFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send({ message: 'Gasolinera no encontrada' });

        const updatedUser = await userModel.updateOne(
            userId,
            { $pull: { gasStatations: { gasStation: station._id } } },
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (err) {
        handleHttpError(res, 'ERROR_REMOVING_GASSTATION');
    }
};

// Añadir o actualizar review
const addOrUpdateReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS, rating, comment } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        const existingReviewIndex = station.reviews.reviewTexts.findIndex(
            r => r.user.toString() === userId.toString()
        );

        if (existingReviewIndex !== -1) {
            station.reviews.reviewTexts[existingReviewIndex] = {
                user: userId,
                rating,
                comment,
                createdAt: new Date()
            };
        } else {
            station.reviews.reviewTexts.push({ user: userId, rating, comment });
        }

        const totalRatings = station.reviews.reviewTexts.length;
        const totalScore = station.reviews.reviewTexts.reduce((acc, r) => acc + r.rating, 0);
        station.reviews.totalRatings = totalRatings;
        station.reviews.scoring = totalScore / totalRatings;

        await station.save();
        res.status(200).send('REVIEW_SAVED');
    } catch (err) {
        handleHttpError(res, 'ERROR_ADDING_REVIEW');
    }
};

// Eliminar review
const deleteReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        station.reviews.reviewTexts = station.reviews.reviewTexts.filter(
            r => r.user.toString() !== userId.toString()
        );

        const totalRatings = station.reviews.reviewTexts.length;
        const totalScore = station.reviews.reviewTexts.reduce((acc, r) => acc + r.rating, 0);
        station.reviews.totalRatings = totalRatings;
        station.reviews.scoring = totalRatings > 0 ? totalScore / totalRatings : 0;

        await station.save();
        res.status(200).send('REVIEW_DELETED');
    } catch (err) {
        handleHttpError(res, 'ERROR_DELETING_REVIEW');
    }
};

const getGasStationWithHistory = async (req, res) => {
    try {
        const { idEESS } = matchedData(req);
        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        const history = await priceHistoryModel
            .find({ gasStation: station._id })
            .sort({ date: -1 })
            .populate('gasStation');

        res.status(200).send({ gasStation: station, priceHistory: history });
    } catch (err) {
        handleHttpError(res, 'ERROR_FETCHING_STATION_HISTORY');
    }
};

module.exports = {
    saveGasStationToFavorites,
    removeGasStationFromFavorites,
    addOrUpdateReview,
    deleteReview,
    getGasStationWithHistory
};
