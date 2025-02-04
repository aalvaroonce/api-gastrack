// Importamos express
const express= require("express");
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger.js")
const cors = require("cors")

// Importamos dotenv
require("dotenv").config();

// Importamos la conexión con la base de datos
const dbConnect= require("./config/mongo.js")
const app= express()

// Middleware para JSON
app.use(express.json())

app.use(cors())

// Definimos el swagger en la /api-docs
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)

// Montar las rutas
app.use("/api", require("./routes"))  

// Seleccionamos el puerto
const port= process.env.PORT || 3000

// Hacemos que el servidor escuche las solicitudes
app.listen(port, ()=>{
    console.log(`Servidor escuchando en el puerto ${port}`)
    dbConnect()
})

module.exports = app
