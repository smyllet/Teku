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
const eventManager = require('./Discord/discordBotModule/EventManager')
const logs = require('./Global/module/logs')

// - - - Chargement de class - - - //
const CommandManager = require('./Discord/Class/CommandManager')
const SondageManager = require('./Discord/Class/SondageManager')

// - - - Chargement Config - - - //
const config = require('./config.json')

// - - - Instantiation du bot - - - //
const dBot = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

// - - - Instantiation des commandes - - - //
const commandManager = new CommandManager()

// - - - Connexion à Discord - - - //
dBot.login(config.bot.discord.token).catch(err => logs.err(err.toString()))

// - - - Discord Bot Event - - - //
// Au démarrage du bot
dBot.on('ready', () => {
    dBot.user.setPresence({
            activities: [
                {
                    name: config.bot.discord.activity
                }
            ],
            status: "online"
        })
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
dBot.on('messageCreate', async message =>
{
    // Reset le compteur pour l'auto clear
    autoClearTextChannels.resetChannelTime(message.channel.id)

    // Ajout création
    if((message.channel.id === config.bot.discord.creation.channel) && message.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(config.bot.discord.creation.keyword)) {
        creationManager.initCreationMessage(message).then(() => {
            logs.info(`Détection d'une création de ${message.member.user.tag}`)
        })
    }

    // Deploy slash commands
    if((message.content === `<@!${dBot.user.id}> deploy slash commands`)) {
        if(!dBot.application?.owner) await dBot.application.fetch()
        if(dBot.application.owner.members.find(m => m.user.id === message.author.id)) {
            await message.guild.commands.set(commandManager.getSlashData())
            await message.reply('déploiement')
        } else await message.delete()
    }
})

// Changement dans l'un des salons vocaux
dBot.on('voiceStateUpdate', (oldState, newState) => {
    // Connexion à un salon vocal
    if(!oldState.channelId && newState.channelId)
    {
        logs.info(`${newState.member.user.tag} c'est connecté au salon ${newState.channel.name}`)
        vocalConnectManager.addRoleToMember(newState.member)

        soundManager.vocalMemberUpdate(newState.channel)
    }

    // Déconnexion d'un salon vocal
    if(oldState.channelId && !newState.channelId)
    {
        logs.info(`${oldState.member.user.tag} c'est déconnecté du salon ${oldState.channel.name}`)
        vocalConnectManager.removeRoleToMember(oldState.member)

        soundManager.vocalMemberUpdate(oldState.channel)
    }

    // Déplacement d'un salon vocal à un autre
    if(oldState.channelId && newState.channelId && (oldState.channelId !== newState.channelId))
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

dBot.on("guildBanAdd", (guildBan) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#d00a27')
        .setTitle(`   Membre Banni   `)
        .addField('Membre', guildBan.user.tag)
        .addField('raison', guildBan.reason)
    staffNotifManager.sendNotif({embed: embed})
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

    // Gestion des validation par réaction
    if(!user.bot) eventManager.emit(`messageReactionAdd_${messageReaction.message.id}`, messageReaction)
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

// Gestion des Interaction
dBot.on('interactionCreate', /** @param {Discord.Interaction||Discord.CommandInteraction} interaction */ async (interaction) => {
    try {
        // Command Slash
        if(interaction.isCommand()) {
            // si une command est retourné
            let command = commandManager.getCommandFromInteraction(interaction)
            if(command) {
                // si le membre à la permission d'utiliser la commande
                if(command.hasPermission(interaction.member)) {
                    // Si la commande est executable
                    if(command.isExecutable())
                    {
                        // Exécuté la commande si toutes les conditions précédente sont réuni
                        command.execute(interaction).then(() => logs.info(`Commande ${command.getFullName()} exécuté par ${interaction.member.user.tag} dans le salon ${interaction.channel.name}`))
                    }
                    else await interaction.reply({content: `Une erreur est survenue lors de l'exécution`, ephemeral: true})
                } else await interaction.reply({content: "'Vous n'avez pas la permission d'exécuter cette commande'", ephemeral: true})
            } else await interaction.reply({content: 'Commande invalide', ephemeral: true})
        }
    } catch (e) {
        logs.err(e.toString())
    }
})