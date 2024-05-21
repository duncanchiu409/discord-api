require('dotenv').config()
const http = require("node:https")

const findFromUniversalId = (id) => {
    return (message) => message.id == id
}

const findAnything = () => {
    return (message) => true
}

const findSeed = () => {
    return (message) => message.content.includes('seed') && message.content.includes('Job ID')
} 

const findFromPrompt = (prompt) => {
    return (message) => message.content.includes(prompt) && !message.content.includes('Image') && !message.content.includes('Variations')
}

const findFromMessageId = (messageId) => {
    return (message) => message.content.includes(messageId) && !message.content.includes('Image') && !message.content.includes('Variations')
}

const findUpcaleFromPrompt = (prompt, button) => {
    return (message) => message.content.includes(prompt) && message.content.includes(`Image #${button[1]}`)
}

const findUpcaleFromMessageId = (messageID, button) => {
    return (message) => message.content.includes(messageID) && message.content.includes(`Image #${button[1]}`)
}

const readDiscordMessage = function(filterFunction){
    const headers = {
        "Authorization": process.env.AUTHORIZATION_ID,
        "Content-Type": "application/json"
    };

    const channelUrl = `https://discord.com/api/v9/channels/${process.env.CHANNEL_ID}/messages?limit=20`;

    var options = {
        method: 'GET',
        headers: headers
    }

    return new Promise(function (resolve, reject) {
        const request = new http.request(channelUrl, options, (res) => {
            let data = []
            console.log('Status Code:', res.statusCode);

            res.on('data', (chunk) => {
                data.push(chunk)
            })

            res.on('close', () => {
                var result = JSON.parse(Buffer.concat(data).toString());
                var matchingMessage = result.filter(message => filterFunction(message))

                if (!matchingMessage.length) {
                    reject('No matching messages!')
                }
                else {
                    resolve(matchingMessage)
                }
            })
        })

        request.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`)
            reject()
        })
        request.end()
    })
}

module.exports = {
    findFromPrompt,
    findFromMessageId,
    findUpcaleFromPrompt,
    findAnything,
    findSeed,
    readDiscordMessage,
}