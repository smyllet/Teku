// - - - Node Modules - - - //
const Discord = require('discord.js')

// - - - Discord Bot Module - - - //
const autoClearTextChannels = require('./Discord/discordBotModule/autoClearTextChannels')
const vocalConnectManager = require('./Discord/discordBotModule/vocalConnectManager')
const memberRoleManager = require('./Discord/discordBotModule/memberRoleManager')
const transfObject = require('./Discord/discordBotModule/transfObject')
const logs = require('./Global/module/logs')

// - - - Chargement de class - - - //
const CommandManager = require('./Discord/Class/CommandManager')

// - - - Chargement Config - - - //
const config = require('./config.json')

// - - - Instantiation du bot - - - //
const dBot = new Discord.Client()

// - - - Instantiation des commandes - - - //
const commandManager = new CommandManager()

// - - - Connexion à Discord - - - //
dBot.login(config.bot.discord.token).catch(err => logs.err(err.toString()))

// - - - Discord Bot Event - - - //
// Au démarrage du bot
dBot.on('ready', () => {
    dBot.user.setPresence({activity: {name: config.bot.discord.activity}, status: "online"}).then()
    logs.info('Bot discord en ligne')

    autoClearTextChannels.init(dBot) // Initialisation de l'auto clear
    vocalConnectManager.init(dBot) // Initialisation du vocal connect manager
    memberRoleManager.init(dBot) // Initialisation du role membre manager
    commandManager.autoAddAllCommand() // Initialisation des commandes
    transfObject.addObject("commandManager", commandManager) // Stockage du commandManager pour la commande help
})

// En cas d'erreur
dBot.on('error', err => logs.err(err.toString()))

// Lors d'un nouveau message
dBot.on('message', message =>
{
    // Reset le compteur pour l'auto clear
    autoClearTextChannels.resetChannelTime(message.channel.id)

    // Commande tchat
    if(message.content.startsWith(config.bot.discord.commandPrefix) && !message.author.bot) // Si les message commence par le prefix de commande et que ce n'est pas un bot
    {
        // si une command est retourné
        let structure = commandManager.getCommandAndArgsFromMessageText(message.content)
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
                    command.execute(message, args).then(() => logs.info(`Commande ${command.getFullName()} exécuté par ${message.member.user.tag} dans le salon ${message.channel.name}`))
                }
                else message.channel.send(`Syntax : ${command.getSyntax()}`)
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
        logs.info(`${newState.member.user.tag} c'est connecté au salon ${newState.channel.name}`)
        vocalConnectManager.addRoleToMember(newState.member)
    }

    // Déconnexion d'un salon vocal
    if(oldState.channelID && !newState.channelID)
    {
        logs.info(`${oldState.member.user.tag} c'est déconnecté du salon ${oldState.channel.name}`)
        vocalConnectManager.removeRoleToMember(oldState.member)
    }

    // Déplacement d'un salon vocal à un autre
    if(oldState.channelID && newState.channelID && (oldState.channelID !== newState.channelID))
    {
        logs.info(`${oldState.member.user.tag} c'est déplacé du salon ${oldState.channel.name} au salon ${newState.channel.name}`)
    }
})

// Arrivé d'un membre sur le serveur
dBot.on('guildMemberAdd', member => {
    logs.info(`${member.user.tag} à rejoins le serveur`)
    memberRoleManager.addRoleToMember(member)
})