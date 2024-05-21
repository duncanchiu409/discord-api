const http = require('node:https')

const createDataURI = function (imageURL) {
    const imageTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp'
    }

    const imageType = Object.keys(imageTypes).filter(key => imageURL.includes(key))[0] || 'png'

    return new Promise(function (resolve, reject) {
        const request = new http.request(imageURL, { method: 'GET' }, (res) => {
            let data = []
            console.log('Status Code:', res.statusCode);

            res.on('data', (chunk) => {
                data.push(chunk)
            })

            res.on('close', () => {
                var result = Buffer.concat(data);
                var dataURI = `data:${imageTypes[imageType] || "image/png"};base64,${result.toString("base64")}`
                resolve(dataURI)
            })
        })

        request.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            reject()
        })
        request.end()
    })
}

module.exports = {
    createDataURI
}