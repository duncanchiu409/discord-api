require('dotenv').config()
const http = require('node:https')

const createPrompt = function (prompt, uniqueId) {
    const postUrl = "https://discord.com/api/v9/interactions";

    const postPayload = {
        type: 2,
        application_id: process.env.APPLICATION_ID,
        guild_id: null,
        channel_id: process.env.CHANNEL_ID,
        session_id: process.env.SESSION_ID,
        data: {
            version: process.env.COMMAND_VERSION,
            id: process.env.IMAGINE_COMMAND_ID,
            name: "imagine",
            type: 1,
            options: [
                {
                    type: 3,
                    name: "prompt",
                    value: `${prompt} --no ${uniqueId}`
                }
            ],
            attachments: []
        },
        // nonce: "1240854710714368000",
        // analytics_location:"slash_ui"
    };

    const headers = {
        "Authorization": process.env.AUTHORIZATION_ID,
        "Content-Type": "application/json"
    }

    return new Promise(function (resolve, reject) {
        const request = http.request(postUrl, { method: 'POST', headers: headers }, res => {
            console.log('Status Code:', res.statusCode);
            resolve()
        })

        request.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            reject()
        });

        request.write(JSON.stringify(postPayload));
        request.end();
    })
}

module.exports = {
    createPrompt
}