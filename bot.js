require('dotenv').config()
const Discord = require('discord.js')
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.ClientReady , () => {
    console.log('Bot is connected !!!')
})

client.on(Events.MessageCreate , (msg) => {
    console.log(JSON.stringify(msg))
})

client.login(process.env.BOT_TOKEN)