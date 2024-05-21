var express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
var bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')

var app = express();
require('dotenv').config()

const { createPrompt } = require('./commands/createPrompt')
const { findFromPrompt, findFromMessageId, readDiscordMessage, findUpcaleFromPrompt, findAnything, findSeed } = require('./commands/readDiscordMessage');
const { createDataURI } = require('./commands/createDataURI');
const { operateDiscordMessage } = require('./commands/operateDiscordMessage');
const { reactEnvelope } = require('./commands/operateDiscordReaction')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function grabSeedFromContent(content){
    const arr = content.split('\n')
    const seed = arr[2].split(' ')

    return seed[1]
}

/**
 * @swagger
 * /imagine:
 *   post:
 *     summary: Write Prompt onto Discord Mid Journey Bot
 *     description: Write Prompt onto Discord Mid Journey Bot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *                 description: The prompt for Mid Journey Bot
 *                 example: Hi, I am a programmer named Duncan
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: bool
 *                   description: Result of request
 *                   example: true
 *                 messageId:
 *                   type: string
 *                   description: uuid of the prompt
 *                   example: 6d2ecc0a-1719-4e77-926a-7e0f97fc9944
 *                 createdAt:
 *                   type: timestamp
 *                   description: The timestamp for the discord message
 *                   example: 2023-05-12T23:51:41.729Z
 *       400:
 *         description: Invalid Parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: bool
 *                   description: Result of request
 *                   example: false
 *                 messageId:
 *                   type: string
 *                   description: The message ID
 *                   example: null
 *                 createdAt:
 *                   type: timestamp
 *                   description: The timestamp for the discord message
 *                   example: null             
 */

app.post('/imagine', async function (req, res) {
    const uniqueId = uuidv4()
    try {
        if(!req.body.msg){
            res.status(400).json({
                success: false,
                messageId: null,
                createdAt: null
            })
        }
        const msg = req.body.msg

        await createPrompt(msg, uniqueId)
        await sleep(5000)
        const filterFunction = findFromMessageId(uniqueId)
        const matchingMessage = await readDiscordMessage(filterFunction)

        res.json({
            success: true,
            messageId: uniqueId,
            createdAt: matchingMessage[0].timestamp
        })
    }
    catch (err) {
        console.error(`Error: ${err}`)
        res.status(500).json({
            success: false,
            messageId: null,
            createdAt: null
        })
    }
})

/**
 * @swagger
 * /button:
 *   post:
 *     summary: Stimulate pressing an button eg 'U1', 'refresh', 'V1' etc.
 *     description: Stimulate pressing an button eg 'U1', 'refresh', 'V1' etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               button:
 *                 type: string
 *                 description: Button option
 *                 example: U1
 *               buttonMessageId:
 *                 type: string
 *                 description: uuid of Prompt
 *                 example: 6d2ecc0a-1719-4e77-926a-7e0f97fc9944
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: bool
 *                   description: Result of request
 *                   example: true
 *                 messageId:
 *                   type: string
 *                   description: uuid of prompt
 *                   example: 6d2ecc0a-1719-4e77-926a-7e0f97fc9944
 *                 createdAt:
 *                   type: timestamp
 *                   description: The timestamp for the discord message
 *                   example: 2023-05-12T23:51:41.729Z
 *       400:
 *         description: Invalid Parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: bool
 *                   description: Result of request
 *                   example: false
 *                 messageId:
 *                   type: string
 *                   description: The message ID
 *                   example: null
 *                 createdAt:
 *                   type: timestamp
 *                   description: The timestamp for the discord message
 *                   example: null             
 */

app.post('/button', async function (req, res) {
    const validButtons = ['U1', 'U2', 'U3', 'U4', 'refresh', 'V1', 'V2', 'V3', 'V4']

    if(!req.body.buttonMessageId){
        res.status(400).json({
            success: false,
            messageId: null,
            createdAt: null
        })
    }

    if(!validButtons.includes(req.body.button)){
        res.status(400).json({
            success: false,
            messageId: null,
            createdAt: null
        })
    }

    const buttonMessageId = req.body.buttonMessageId
    const button = req.body.button

    try {
        var filterFunction = findFromMessageId(buttonMessageId)
        var matchingMessage = await readDiscordMessage(filterFunction)
        var messageID = matchingMessage[0].id

        var customID;
        if (button.includes('U')) {
            customID = matchingMessage[0].components[0].components.filter(component => component.label == button)[0].custom_id
        }
        else if (button.includes('V')) {
            customID = matchingMessage[0].components[1].components.filter(component => component.label == button)[0].custom_id
        }
        else {
            customID = matchingMessage[0].components[0].components[4].custom_id
        }

        await operateDiscordMessage(messageID, customID)
        await sleep(5000)

        if (button.includes('U')) {
            filterFunction = findUpcaleFromPrompt(buttonMessageId, button)
        }
        else if (button.includes('V')) {
            customID = matchingMessage[0].components[1].components.filter(component => component.label == button)[0].custom_id
        }
        else {
            customID = matchingMessage[0].components[0].components[4].custom_id
        }

        matchingMessage = await readDiscordMessage(filterFunction)

        res.json({
            success: true,
            messageID: buttonMessageId,
            createdAt: matchingMessage[0].timestamp
        })
    }
    catch (err) {
        console.error(err)
        res.status(400).json({
            success: false,
            messageID: null,
            createdAt: null
        })
    }
})

/**
 * @swagger
 * /status/{id}:
 *   post:
 *     summary: Read the status of a specific discord message
 *     description: Read the status of a specific discord message
*/

app.post('/status/:id', function (req, res) {
    res.json({
        msg: 'Success'
    })
})

/**
 * @swagger
 * /slash-commands:
 *   post:
 *     summary: Write slash-commands onto Discord Mid Journey Bot
 *     description: Write slash-commands onto Discord Mid Journey Bot
*/

app.post('/slash-commands', function (req, res) {
    if(!req.body.cmd){
        res.status(400).json({
            success: false,
            messageId: null,
            createdAt: null
        })
    }

    const cmd = req.body.cmd

    try{
        res.json({
            cmd: cmd
        })
    }
    catch(err){
        console.error(err)
        res.status(400).json({
            success: false,
            messageId: null,
            createdAt: null
        })
    }
})

/**
 * @swagger
 * /seed/{id}:
 *   get:
 *     summary: Get the seed of the message
 *     description: Get the seed of the message
 *     parameters: 
 *       - in: path
 *         name: messageId
 *         description: The message id of the target
 *         schema:
 *           type: string
 *           example: 1242382865660903507
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seed:
 *                   type: string
 *                   description: seed of the Image
 *                   example: 1234646
 *       400:
 *         description: Invalid Parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seed:
 *                   type: string
 *                   description: seed of the Image
 *                   example: null
*/

app.get('/seed/:id', async function(req, res){
    if(!req.params.id){
        res.status(400).json({
            seed: null
        })
    }

    const id = req.params.id 

    try{
        await reactEnvelope(id)
        await sleep(5000)
        const filterFunction = findSeed()
        const matchingMessage = await readDiscordMessage(filterFunction)
        const result = grabSeedFromContent(matchingMessage[0].content)

        res.json({
            seed: result
        })
    }
    catch(err){
        console.error(err)
        res.status(400).json({
            seed: null
        })
    }
})

app.post('/anything', async function (req, res){
    const id = req.body.id

    const filterFunction = findAnything()
    const matchingMessage = await readDiscordMessage(filterFunction)

    res.json(matchingMessage)
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log(`Link is http://${host}:${port}`)
})
