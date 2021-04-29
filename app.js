// - - - Node Modules - - - //
const Discord = require('discord.js')

// - - - Discord Bot Module - - - //
const autoClearTextChannels = require('./Discord/discordBotModule/autoClearTextChannels')
const vocalConnectManager = require('./Discord/discordBotModule/vocalConnectManager')
const memberRoleManager = require('./Discord/discordBotModule/memberRoleManager')
const staffNotifManager = require('./Discord/discordBotModule/staffNotifManager')
const transfObject = require('./Discord/discordBotModule/transfObject')
const soundManager = require('./Discord/discordBotModule/soundManager')
const creationManager = require('./Discord/discordBotModule/creationManager')
const logs = require('./Global/module/logs')

// - - - Chargement de class - - - //
const CommandManager = require('./Discord/Class/CommandManager')
const SondageManager = require('./Discord/Class/SondageManager')

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
    staffNotifManager.init(dBot) // Initialisation du staff notif manager
    soundManager.init(dBot) // Initialisation du sound manager
    commandManager.autoAddAllCommand() // Initialisation des commandes
    transfObject.addObject("commandManager", commandManager) // Stockage du commandManager pour la commande help
    dBot.guilds.fetch(config.bot.discord.guildId).then(guild => {
        SondageManager.loadFromFile(guild).then(() => logs.info('Sondage(s) chargé')) // Chargement des sondages
    })
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

    // Ajout création
    if((message.channel.id === config.bot.discord.creation.channel) && message.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(config.bot.discord.creation.keyword)) {
        creationManager.initCreationMessage(message).then(() => {
            logs.info(`Détection d'une création de ${message.member.user.tag}`)
        })
    }
})

// Changement dans l'un des salons vocaux
dBot.on('voiceStateUpdate', (oldState, newState) => {
    // Connexion à un salon vocal
    if(!oldState.channelID && newState.channelID)
    {
        logs.info(`${newState.member.user.tag} c'est connecté au salon ${newState.channel.name}`)
        vocalConnectManager.addRoleToMember(newState.member)

        soundManager.vocalMemberUpdate(newState.channel)
    }

    // Déconnexion d'un salon vocal
    if(oldState.channelID && !newState.channelID)
    {
        logs.info(`${oldState.member.user.tag} c'est déconnecté du salon ${oldState.channel.name}`)
        vocalConnectManager.removeRoleToMember(oldState.member)

        soundManager.vocalMemberUpdate(oldState.channel)
    }

    // Déplacement d'un salon vocal à un autre
    if(oldState.channelID && newState.channelID && (oldState.channelID !== newState.channelID))
    {
        logs.info(`${oldState.member.user.tag} c'est déplacé du salon ${oldState.channel.name} au salon ${newState.channel.name}`)

        soundManager.vocalMemberUpdate(newState.channel)
        soundManager.vocalMemberUpdate(oldState.channel)
    }
})

// Arrivé d'un membre sur le serveur
dBot.on('guildMemberAdd', member => {
    logs.info(`${member.user.tag} à rejoins le serveur`)
    memberRoleManager.addRoleToMember(member)
})

dBot.on('guildMemberRemove', member => {
    staffNotifManager.sendNotif(`${member.user.tag} a quitté le serveur`)
})

dBot.on("guildBanAdd", (guild, user) => {
    guild.fetchBan(user).then(banInfo => {
        let embed = new Discord.MessageEmbed()
            .setColor('#d00a27')
            .setTitle(`   Membre Banni   `)
            .addField('Membre', user.tag)
            .addField('raison', banInfo.reason)
        staffNotifManager.sendNotif({embed: embed})
    })
})

// Ajout d'une réaction à un message
dBot.on('messageReactionAdd', async (messageReaction, user) => {
    // Gestion réaction sondages
    let sondage = SondageManager.getSondageByMessageId(messageReaction.message.id)
    if(sondage && !user.bot) {
        let userReacts = messageReaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id))

        let option = sondage.getOptionByEmote(messageReaction.emoji.toString())
        if(option) {
            if(userReacts.size <= 1) option.up()
            else await userReacts.forEach( (messageReaction, emote) => {
                // Récupération emote custom
                let emoji = messageReaction.message.guild.emojis.cache.find(emoji => emoji.id === emote)
                if(emoji) emote = emoji.toString()

                if(emote === option.getEmote()) option.up()
                else messageReaction.users.remove(user.id)
            })

            sondage.update()
        }
        else await messageReaction.remove()
    }
})

// Suppression d'une réaction à un message
dBot.on('messageReactionRemove', async (messageReaction, user) => {
    // Gestion réaction sondages
    let sondage = SondageManager.getSondageByMessageId(messageReaction.message.id)
    if(sondage && !user.bot) {
        let option = sondage.getOptionByEmote(messageReaction.emoji.toString())
        if(option) {
            option.down()
            sondage.update()
        }
    }
})

// Suppression de toute les réactions d'un message
dBot.on('messageReactionRemoveAll', async (message) => {
    // Gestion réaction sondages
    let sondage = SondageManager.getSondageByMessageId(message.id)
    if(sondage) {
        SondageManager.removeSondage(sondage)
    }
})

// Suppression d'un message
dBot.on('messageDelete', (message) => {
    // Gestion réaction sondages
    let sondage = SondageManager.getSondageByMessageId(message.id)
    if(sondage) {
        logs.warn('Sondage supprimé')
        SondageManager.removeSondage(sondage)
    }
})

// Suppression d'un embed
dBot.on('messageUpdate', async (oldMessage, newMessage) => {
    // Gestion réaction sondages
    let sondage = SondageManager.getSondageByMessageId(newMessage.id)
    if(sondage && (newMessage.embeds.length < 1)) {
        logs.warn('Intégration de sondage supprimé')
        await newMessage.delete()
    }
})