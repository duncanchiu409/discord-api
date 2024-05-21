require('dotenv').config()
const http = require('node:https')

const operateDiscordMessage = function (messageID, customID) {
    const postUrl = "https://discord.com/api/v9/interactions";

    const headers = {
        "Authorization": process.env.AUTHORIZATION_ID,
        "Content-Type": "application/json"
    };

    const postPayload = {
        type: 3,
        // "nonce": "1241289990013452288",
        guild_id: null,
        channel_id: process.env.CHANNEL_ID,
        message_flags: 0,
        message_id: messageID,
        application_id: process.env.APPLICATION_ID,
        session_id: process.env.SESSION_ID,
        data: {
            component_type: 2,
            custom_id: customID
        }
    }

    return new Promise(function (resolve, reject) {
        const request = http.request(postUrl, {
            method: "POST",
            headers: headers
        }, res => {
            console.log('Status Code:', res.statusCode);
            resolve()
        })

        request.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            reject()
        });

        request.write(JSON
            .stringify(postPayload));
        request.end();
    })
}

module.exports = {
    operateDiscordMessage
}