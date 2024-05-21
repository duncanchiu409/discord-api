require('dotenv').config()
const http = require('node:https')

const reactEnvelope = function(messageId){
    const channelUrl = `https://discord.com/api/v9/channels/${process.env.CHANNEL_ID}/messages/${messageId}/reactions/%E2%9C%89%EF%B8%8F/%40me?location=Message&type=0`

    const headers = {
        "Authorization": process.env.AUTHORIZATION_ID
    }

    const options = {
        method: 'PUT',
        headers: headers
    }

    return new Promise(function (resolve, reject) {
        const request = new http.request(channelUrl, options, (res) => {
            console.log('Status Code:', res.statusCode);
            resolve()
        })

        request.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`)
            reject()
        })
        request.end()
    })
}

module.exports = {
    reactEnvelope
}