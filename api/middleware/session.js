const { verifyToken } = require("../utils/handleJwt")
const { usersModel, businessModel } = require("../models")

const authMiddleware = async (req, res, next) => {

    try{

        if (!req.headers.authorization) {
            res.status(401).send({ message: "Es necesario introducir el token" })
            return
        }

        // Nos llega la palabra reservada Bearer (es un estándar) y el Token, así que me quedo con la última parte
        const token = req.headers.authorization.split(' ').pop()

        //Del token, miramos en Payload (revisar verifyToken de utils/handleJwt)
        const dataToken = await verifyToken(token)

        if(!dataToken._id) {
            return res.status(401).send({ message: "El token no posee id" })
        }

        const user = await usersModel.findById(dataToken._id)
        req.user = user // Inyecto al user en la petición

        next()

    }
    catch(err){

        res.status(401).send({ message: "No ha iniciado sesión" })

    }

}


module.exports = {authMiddleware}