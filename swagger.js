const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'My Mid Journey API',
        version: '1.0.0',
        description: 'My Mid Journey API Description',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://ihavenoidea.org/licenses/MIT.html',
        },
        contact: {
            name: 'Duncan Chiu',
            url: 'chiuduncan409@gmail.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:8081',
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./app.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;