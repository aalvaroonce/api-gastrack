// Importamos el modulo de mongoose para interactuar con la base de datos
const mongoose = require("mongoose")

// Importamos mongoose-delete para poder realizar un borrado lógico
const mongooseDelete = require("mongoose-delete")

//Definimos el esquema 
const usersScheme = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        age:{
            type: Number
        },
        city: {
            type: String
        },
        country:{
            type: String
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
        {
        timestamps: true, 
        versionKey: false
    }

)

// Aplicamos el plugin de borrado lógico, sobreescribiendo los métodos habituales de mongoose para que trabajen con el borrado lógico
usersScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("users", usersScheme) // users es el nombre de la colección en mongoDB