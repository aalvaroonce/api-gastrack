const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { userModel } = require('../models');
const { uploadToPinata } = require('../utils/handleUploadIPFS');
const { handleHttpError } = require('../utils/handleError');

const getUsers = async (req, res) => {
    const { upwards, deleted } = req.query;

    if (upwards !== undefined && upwards !== 'true' && upwards !== 'false') {
        return res
            .status(400)
            .send({ message: 'Inserte una query correcta (upwards=true o upwards=false)' });
    }

    if (deleted !== undefined && deleted !== 'true' && deleted !== 'false') {
        return res
            .status(400)
            .send({ message: 'Inserte una query correcta (deleted=true o deleted=false)' });
    }

    let sortOrder = upwards === 'true' ? 1 : upwards === 'false' ? -1 : null;

    try {
        let users;

        if (deleted === 'true') {
            users = await userModel
                .findDeleted()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        } else if (deleted === 'false') {
            users = await userModel
                .find()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        } else {
            users = await userModel
                .findWithDeleted()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        }

        res.status(200).send(users);
    } catch (err) {
        // Control de errores, en caso de fallo en el código
        res.status(500).send({ message: 'Error al obtener los usuarios', error: err.message });
    }
};

const getUser = async (req, res) => {
    const id = req.user._id;

    try {
        // Buscar user por id
        const user = await userModel.findById(id);

        // Si no existe
        if (!user) {
            return res.status(404).send({ message: 'User no encontrado' });
        }

        // Enviar el user elegida
        res.status(200).send({ message: 'User solicitado', data: user });
    } catch (err) {
        // Control de errores, en caso de fallo en el código
        res.status(500).send({ message: 'Error al obtener el user', error: err.message });
    }
};

const changePassword = async (req, res) => {
    const id = req.user._id;
    const { currentPassword, newPassword } = matchedData(req);

    try {
        // Intentar encontrar un usuario por email en userModel
        let user = await userModel.findOne({ _id: id }).select('+password');

        // Si no encuentra un usuario, buscar en userModel
        if (!user) {
            return res.status(404).send({ message: 'USER_NOT_EXISTS' });
        }
        const hashPassword = user.password;
        const isPasswordValid = await compare(currentPassword, hashPassword);

        if (!isPasswordValid) {
            return res.status(401).send({ message: 'LAST_PASSWORD_INCORRECT' });
        } else {
            const newPasswordHashed = await encrypt(newPassword);
            await userModel.findOneAndUpdate(
                { _id: id },
                { password: newPasswordHashed },
                { new: true }
            );
            return res.status(200).send({ message: 'CORRECT_PASSWORD', data: true });
        }
    } catch (err) {
        console.error('Error en el cambio de contraseña:', err);
        return handleHttpError(res, {
            message: 'Error al comprobar y añadir la contraseña',
            error: err.message
        });
    }
};

const addImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const user = userModel.findById(userId);

        if (user.urlToAvatar) {
            const parts = user.urlToAvatar.split('/ipfs/');
            if (parts.length === 2) {
                const previousHash = parts[1];
                await deleteFromPinata(previousHash).catch(() => {});
            }
        }

        const pinataResponse = await uploadToPinata(fileBuffer, fileName, userId);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        const data = await userModel.updateOne(
            { _id: userId },
            { urlToAvatar: ipfs },
            { new: true }
        );

        res.status(200).send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_ADDING_IMAGE_TO_CLOUD');
    }
};

const updateUser = async (req, res) => {
    const { body } = matchedData(req);
    const id = req.user._id;

    try {
        const updatedUser = await userModel.updateOne(id, body, { new: true });

        if (!updatedUser) {
            return res.status(404).send('USER_NOT_FOUND');
        }

        res.status(200).send(updatedUser);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_UPDATING_USER');
    }
};

// Restaurar un user que ha sido eliminado lógicamente
const restoreUser = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const exist = await userModel.findOneWithDeleted({ _id: id });
        if (!exist) {
            return res.status(404).send('USER_NOT_FOUND');
        }
        if (!exist.deleted) {
            return res.status(404).send('USER_NOT_ELIMMINATED');
        }
        const restored = await userModel.restore({ _id: id });
        res.status(200).send(restored);
    } catch (err) {
        console.log(err);
        res.status(500).send('ERROR_RECOVERING_USER');
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.user._id;
        const { logic } = req.query;
        if (logic === 'true') {
            const deleteLogical = await userModel.delete({ _id: id });
            if (!deleteLogical) {
                return res.status(404).send(`USER_${id}_NOT_FOUND`);
            }
            res.status(200).send(deleteLogical);
        } else {
            const userToDelete = await userModel.findOne({ _id: id });

            if (!userToDelete) {
                return res.status(404).send('USER_NOT_FOUND');
            }

            if (userToDelete.urlToAvatar) {
                const imageCid = userToDelete.urlToAvatar.split('/ipfs/') ? parts[1] : null;
                deleteFromPinata(imageCid);
            }
            const deleted = await userModel.findOneAndDelete({ _id: id });
            if (!deleted) {
                return res.status(404).send(`USER_NOT_FOUND_WITH_${id}`);
            }
            res.status(200).send(deleted);
        }
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_DELETE_USER');
    }
};

module.exports = {
    updateUser,
    getUsers,
    getUser,
    restoreUser,
    changePassword,
    deleteUser,
    addImage
};
