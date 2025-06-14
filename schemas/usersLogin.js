module.exports = {
    type: 'object',
    required: ['email, password'],
    properties: {
        email: {
            type: 'string',
            example: 'a.car@immune.com'
        },
        password: {
            type: 'string',
            example: 'Contra3$.12'
        }
    }
};
