module.exports = {
    type: "object",
    required: ["email", "password"],
    properties: {
        name: {
            type: "string",
            example: "Pedro Picapiedra"
        },
        email: {
            type: "string",
            example: "pedropicapiedra@example.com"
        },
        password: {
            type: "string",
            example: "a1.Qvelka23-"
        },
        age:{
            type: "string",
            example: "25"
        },
        city: {
            type: "string"
        },
        country: {
            type: "string",
            example: "es"
        }
    }
}

