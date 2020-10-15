// Node Modules
const Discord = require('discord.js')

// Chargement Config
const config = require('./config.json')

// Instatiation du bot
const bot = new Discord.Client()

// Au démarrage du bot
bot.on('ready', ()=>{
    bot.user.setActivity(config.discord.description)
    console.log("Bot connecté")
})

// En cas d'erreur
bot.on('error', (error) =>
{
    console.log("Une erreur est survenue dans la connexion avec discord : " + error.toString())
})

module.exports = bot