const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.1.0',

        info: {
            title: ' Gastrack API ',
            version: '0.1.0',
            description: 'The best app if we are talking about gasStations',

            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html'
            },

            contact: {
                name: 'Álvaro Caravaca Díez',
                url: '',
                email: 'alvarodiezz16@gmail.com'
            }
        },

        servers: [
            {
                url: 'https://inclined-bonnibelle-bildyapp-1fff10be.koyeb.app/',
                description: 'Pre'
            },
            {
                url: 'http://localhost:8000',
                description: 'Local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                }
            },

            schemas: {
                userLogin: require('../schemas/usersLogin'),
                userRegister: require('../schemas/usersRegister'),
                userDataLogin: require('../schemas/userDataLogin'),
                userData: require('../schemas/userData'),
                userUpdate: require('../schemas/userUpdate'),
                mailCode: require('../schemas/mailCode'),
                mailRecover: require('../schemas/mailRecover'),
                orderUpdateStatus: require('../schemas/orderUpdateStatus'),
                vehicleInput: require('../schemas/vehicleInput')
            }
        }
    },

    apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
