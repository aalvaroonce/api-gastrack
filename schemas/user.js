module.exports= { 
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
        age:{
            type: "string",
            example: "25"
        },
        city: {
            type: "string",
            example: "Madrid"
        },
        country: {
            type: "string",
            example: "es"
        }
        
    }
}