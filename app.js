// - - - Node Modules - - - //
const Discord = require('discord.js')

// Discord Bot Module
const autoClearTextChannels = require('./discordBotModule/autoClearTextChannels')

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

    autoClearTextChannels.init(dBot) // Initialisation de l'auto clear
})

// En cas d'erreur
dBot.on('error', console.error)

// Lors d'un nouveau message
dBot.on('message', message =>
{
    autoClearTextChannels.resetChannelTime(message.channel.id) // reset le compteur pour l'auto clear
})

