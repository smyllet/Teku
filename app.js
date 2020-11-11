// - - - Node Modules - - - //
const Discord = require('discord.js')

// - - - Chargement Config - - - //
const config = require('./config.json')

// - - - Instantiation du bot - - - //
const dBot = new Discord.Client()

// - - - Connexion à Discord - - - //
dBot.login(config.bot.discord.token).catch(console.error)

// - - - Discord Bot Event - - - //
// Au démarrage du bot
dBot.on('ready', () => {
    dBot.user.setPresence({ activity : {name : config.bot.discord.activity}, status : "online"})
    console.log('Bot discord en ligne')
})

dBot.on('error', console.error)
