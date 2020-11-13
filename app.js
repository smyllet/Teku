// - - - Node Modules - - - //
const Discord = require('discord.js')

// Discord Bot Module
const autoClearTextChannels = require('./discordBotModule/autoClearTextChannels')
const vocalConnectManager = require('./discordBotModule/vocalConnectManager')

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
    vocalConnectManager.init(dBot) // Initialisation du vocal connect manager
})

// En cas d'erreur
dBot.on('error', console.error)

// Lors d'un nouveau message
dBot.on('message', message =>
{
    autoClearTextChannels.resetChannelTime(message.channel.id) // reset le compteur pour l'auto clear
})

// Changement dans l'un des salons vocaux
dBot.on('voiceStateUpdate', (oldState, newState) => {
    // Connexion à un salon vocal
    if(!oldState.channelID && newState.channelID)
    {
        console.log(`${newState.member.user.tag} c'est connecté au salon ${newState.channel.name}`)
        vocalConnectManager.addRoleToMember(newState.member)
    }

    // Déconnexion d'un salon vocal
    if(oldState.channelID && !newState.channelID)
    {
        console.log(`${oldState.member.user.tag} c'est déconnecté du salon ${oldState.channel.name}`)
        vocalConnectManager.removeRoleToMember(oldState.member)
    }

    // Déplacement d'un salon vocal à un autre
    if(oldState.channelID && newState.channelID && (oldState.channelID !== newState.channelID))
    {
        console.log(`${oldState.member.user.tag} c'est déplacé du salon ${oldState.channel.name} au salon ${newState.channel.name}`)
    }
})

