var express = require('express');
var app = express();
var http = require('node:https')
require('dotenv').config()
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

function generateId() {
    return Math.floor(Math.random() * 1000)
}

app.get('/discord', async function (req, res) {
    const postUrl = "https://discord.com/api/v9/interactions";
    const uniqueId = generateId();

    const postPayload = {
        type: 2,
        application_id: process.env.APPLICATION_ID,
        guild_id: process.env.GUILD_ID,
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
                    value: `AJ is smart --v 5`
                }
            ],
            // application_command: {
            //     id: process.env.IMAGINE_COMMAND_ID,
            //     application_id: process.env.APPLICATION_ID,
            //     version: process.env.COMMAND_VERSION,
            //     default_member_permissions: null,
            //     type: 1,
            //     name: "imagine",
            //     description: "Create images with Midjourney",
            //     dm_permission: true,
            //     contexts: [0, 1, 2],
            //     integration_types: [0, 1],
            //     options: [
            //         {
            //             type: 3,
            //             name: "prompt",
            //             description: "The prompt to imagine",
            //             required: true,
            //             description_localized:"The prompt to imagine",
            //             name_localized: "prompt"
            //         }
            //     ]
            // },
            attachments: []
        },
        // nonce: "1240854710714368000",
        // analytics_location:"slash_ui"
    };


    const postHeaders = {
        "Authorization": process.env.AUTHORIZATION_ID,
        "Content-Type": "application/json"
    };

    var clientServerOptions = {
        uri: postUrl,
        body: postPayload,
        method: 'POST',
        headers: postHeaders
    }

    var options = {
        method: 'POST',
        headers: postHeaders
    }

    const reqes = http.request(postUrl, options, res => 
        {
            console.log(res)
        }
    )

    // await request(clientServerOptions, (error, response) => {
    //     console.error(error)
    //     console.log(response)
    // })

    reqes.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    reqes.write(JSON
        .stringify(postPayload));
    reqes.end();

    res.send('Hello World')
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log(`Link is http://${host}:${port}`)
})
