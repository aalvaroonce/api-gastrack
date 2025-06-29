const { matchedData } = require('express-validator');
const { gasStationModel, userModel, priceHistoryModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');

// Guardar gasolinera como favorita
const saveGasStationToFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        const user = await userModel.findById(userId);
        const alreadyFavorite = user.gasStations.some(
            stationId => stationId.toString() === station._id.toString()
        );

        if (alreadyFavorite) return res.status(409).send('GASSTATION_ALREADY_IN_FAVORITES');

        const updatedUser = await userModel.updateOne(
            { _id: userId },
            { $addToSet: { gasStations: station._id } }
        );

        await gasStationModel.findOneAndUpdate(
            { idEESS },
            { $set: { saved: true } },
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (err) {
        console.log(err);
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
            { _id: userId },
            { $pull: { gasStations: station._id } },
            { new: true }
        );

        res.status(200).send(updatedUser);
    } catch (err) {
        console.log(err);
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

const getSavedGasStations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name } = req.query;

        const user = await userModel.findById(userId).populate({
            path: 'gasStations',
            match: name ? { brand: { $regex: name, $options: 'i' } } : {}
        });

        if (!user || !user.gasStations || user.gasStations.length === 0) {
            return res.status(404).send('NOT_SAVED_GASSTATIONS');
        }

        res.status(200).send(user.gasStations);
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_FETCHING_STATION_HISTORY');
    }
};

const toggleLikeReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS, reviewId } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        const review = station.reviews.reviewTexts.id(reviewId);
        if (!review) return res.status(404).send('REVIEW_NOT_FOUND');

        const hasLiked = review.likes.includes(userId);
        const hasDisliked = review.dislikes.includes(userId);

        if (hasLiked) {
            review.likes.pull(userId);
        } else {
            if (hasDisliked) review.dislikes.pull(userId);
            review.likes.push(userId);
        }

        await station.save();
        res.status(200).send('LIKE_UPDATED');
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_TOGGLING_LIKE');
    }
};

const toggleDislikeReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { idEESS, reviewId } = matchedData(req);

        const station = await gasStationModel.findOne({ idEESS });
        if (!station) return res.status(404).send('GASSTATION_NOT_FOUND');

        const review = station.reviews.reviewTexts.id(reviewId);
        if (!review) return res.status(404).send('REVIEW_NOT_FOUND');

        const hasDisliked = review.dislikes.includes(userId);
        const hasLiked = review.likes.includes(userId);

        if (hasDisliked) {
            review.dislikes.pull(userId);
        } else {
            if (hasLiked) review.likes.pull(userId);
            review.dislikes.push(userId);
        }

        await station.save();
        res.status(200).send('DISLIKE_UPDATED');
    } catch (err) {
        console.error(err);
        handleHttpError(res, 'ERROR_TOGGLING_DISLIKE');
    }
};

module.exports = {
    saveGasStationToFavorites,
    removeGasStationFromFavorites,
    addOrUpdateReview,
    deleteReview,
    getSavedGasStations,
    toggleLikeReview,
    toggleDislikeReview
};
