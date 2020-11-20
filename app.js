// - - - Node Modules - - - //
const Discord = require('discord.js')

// Discord Bot Module
const autoClearTextChannels = require('./Discord/discordBotModule/autoClearTextChannels')
const vocalConnectManager = require('./Discord/discordBotModule/vocalConnectManager')

// Chargement de class
const CommandManager = require('./Discord/Class/CommandManager')

// - - - Chargement Config - - - //
const config = require('./config.json')

// - - - Instantiation du bot - - - //
const dBot = new Discord.Client()

// - - - Instantiation des commandes
const commandManager = new CommandManager()

// - - - Connexion à Discord - - - //
dBot.login(config.bot.discord.token).catch(console.error)

// - - - Discord Bot Event - - - //
// Au démarrage du bot
dBot.on('ready', () => {
    dBot.user.setPresence({activity: {name: config.bot.discord.activity}, status: "online"}).then()
    console.log('Bot discord en ligne')

    autoClearTextChannels.init(dBot) // Initialisation de l'auto clear
    vocalConnectManager.init(dBot) // Initialisation du vocal connect manager
    commandManager.autoAddAllCommand()
})

// En cas d'erreur
dBot.on('error', console.error)

// Lors d'un nouveau message
dBot.on('message', message =>
{
    // Reset le compteur pour l'auto clear
    autoClearTextChannels.resetChannelTime(message.channel.id)

    // Commande tchat
    if(message.content.startsWith(config.bot.discord.commandPrefix) && !message.author.bot) // Si les message commence par le prefix de commande et que ce n'est pas un bot
    {
        // si une command est retourné
        let structure = commandManager.getCommandAndArgsFromMessage(message)
        if(structure)
        {
            let command = structure.command
            let args = structure.args

            // si le membre à la permission d'utiliser la commande
            if(command.hasPermission(message.member))
            {
                // Si la commande est executable
                if(command.isExecutable(args))
                {
                    // Exécuté la commande si toutes les conditions précédente sont réuni
                    command.execute(message, args).then(() => console.log(`Commande exécuté par ${message.member.user.tag} dans le salon ${message.channel.name}`))
                }
                else message.channel.send(`Syntax : ${command.syntax}`)
            }
            else message.channel.send("Vous n'avez pas la permission d'exécuter cette commande")
        }
        else message.channel.send(`Commande invalide`)
    }
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