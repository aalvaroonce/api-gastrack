const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models');
const { uploadToPinata } = require('../utils/handleUploadIPFS');
const { handleHttpError } = require('../utils/handleError');

const getUsers = async (req, res) => {
    const { upwards, deleted } = req.query; // Obtenemos los parámetros de la URL

    // Validamos que 'upwards' tenga un valor válido o esté ausente
    if (upwards !== undefined && upwards !== 'true' && upwards !== 'false') {
        return res
            .status(400)
            .send({ message: 'Inserte una query correcta (upwards=true o upwards=false)' });
    }

    // Validamos que 'deleted' tenga un valor válido o esté ausente
    if (deleted !== undefined && deleted !== 'true' && deleted !== 'false') {
        return res
            .status(400)
            .send({ message: 'Inserte una query correcta (deleted=true o deleted=false)' });
    }

    // Definimos sortOrder en función de cómo se quieran pasar los datos
    let sortOrder = upwards === 'true' ? 1 : upwards === 'false' ? -1 : null;

    try {
        let users;

        if (deleted === 'true') {
            users = await usersModel
                .findDeleted()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        } else if (deleted === 'false') {
            // Buscar solo documentos no eliminados
            users = await usersModel
                .find()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        } else {
            users = await usersModel
                .findWithDeleted()
                .sort(sortOrder ? { _id: sortOrder } : {})
                .select('-attempt -role -emailCode');
        }
        // Determinar el mensaje según el valor de 'upwards'
        const message = `${
            sortOrder === 1
                ? 'Usuarios ordenados ascendentemente (por id)'
                : sortOrder === -1
                  ? 'Usuarios ordenados descendentemente (por id)'
                  : 'Usuarios'
        }${deleted === 'true' ? ' eliminadas' : deleted === 'false' ? ' activas' : ''}`;

        res.status(200).send({ message: message, users: users });
    } catch (err) {
        // Control de errores, en caso de fallo en el código
        res.status(500).send({ message: 'Error al obtener los usuarios', error: err.message });
    }
};

const getUser = async (req, res) => {
    const id = req.user._id;

    try {
        // Buscar user por id
        const user = await usersModel.findById(id);

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
            await usersModel.findOneAndUpdate(
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
        const pinataResponse = await uploadToPinata(fileBuffer, fileName, userId);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        const data = await usersModel.updateOne(
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
    const { id, ...body } = matchedData(req); // Obtener los datos del cuerpo de la solicitud y el id de la URL

    try {
        // Actualizar user por id
        const updatedUser = await usersModel.updateOne(id, body, { new: true });

        // Si no existe
        if (!updatedUser) {
            return res.status(404).send({ message: `User con id: ${id} no encontrado` });
        }

        // Enviar el user actualizada
        res.status(200).send({ message: 'User actualizado', data: updatedUser });
    } catch (err) {
        // Control de errores, en caso de fallo en el código
        res.status(500).send({ message: 'Error al actualizar la user', error: err.message });
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
