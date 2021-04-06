const creationManager = require('../../Discord/discordBotModule/creationManager')

config = require('../../config.json')

module.exports = {
    name: "creation",
    description: "Gestion des création",
    syntax: "creation [init|cancel|reset] <id_message>",
    enable: true,
    argsRequire: false,
    role: "moderator",
    subCommands:
        {
            init:
                {
                    name: "init",
                    description: "Définir un message comme création",
                    syntax: "creation init <id_message>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        let messageBot = null

                        // Récupérer le message demandé en arguments
                        let creation = message.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(args[0])

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) messageBot = await message.channel.send(`Aucun message portant cet id n'a été trouvé dans le salon ${message.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`)
                        // Sinon si le message est épinglé
                        else if(creation.pinned) {
                            // Avertir l'utilisateur que le message est déjà une création
                            messageBot = await message.channel.send('Ce message est déjà défini comme création, il peux être réinitialisé avec la commande `creation reset <id_message>`')
                        }
                        // Sinon
                        else {
                            // Initialisé le message comme une création
                            await creationManager.initCreationMessage(creation).then(async () => {
                                messageBot = await message.channel.send(`Le message de ${message.member.user.tag} à bien été défini comme création`)
                            })
                        }

                        // Supprimer les messages du bot au bout de 5 seconde si ils sont dans le salon création
                        if(message.channel.id === config.bot.discord.creation.channel) {
                                message.delete({timeout: 2000})
                                if(messageBot) messageBot.delete({timeout: 2000})
                        }
                    }
                },
            cancel:
                {
                    name: "cancel",
                    description: "Retiré un message comme création",
                    syntax: "creation cancel <id_message>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        let messageBot = null

                        // Récupérer le message demandé en arguments
                        let creation = message.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(args[0])

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) messageBot = await message.channel.send(`Aucun message portant cet id n'a été trouvé dans le salon ${message.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`)
                        // Sinon si le message n'est pas épinglé
                        else if(!creation.pinned) {
                            // Avertir l'utilisateur que le message n'est pas une création
                            messageBot = await message.channel.send(`Ce message n'est pas une création`)
                        }
                        // Sinon
                        else {
                            // Annulé le message comme création
                            await creationManager.cancelCreationMessage(creation).then(async () => {
                                messageBot = await message.channel.send(`Le message de ${message.member.user.tag} n'est plus une création`)
                            })
                        }

                        // Supprimer les messages du bot au bout de 5 seconde si ils sont dans le salon création
                        if(message.channel.id === config.bot.discord.creation.channel) {
                            message.delete({timeout: 2000})
                            if(messageBot) messageBot.delete({timeout: 2000})
                        }
                    }
                },
            reset:
                {
                    name: "reset",
                    description: "Réinitialisé un message comme création",
                    syntax: "creation reset <id_message>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        let messageBot = null

                        // Récupérer le message demandé en arguments
                        let creation = message.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(args[0])

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) messageBot = await message.channel.send(`Aucun message portant cet id n'a été trouvé dans le salon ${message.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`)
                        // Sinon si le message n'est pas épinglé
                        else if(!creation.pinned) {
                            // Avertir l'utilisateur que le message n'est pas une création
                            messageBot = await message.channel.send(`Ce message n'est pas une création`)
                        }
                        // Sinon
                        else {
                            // Réinitialisé le message comme création
                            await creationManager.resetCreationMessage(creation).then(async () => {
                                messageBot = await message.channel.send(`Le message de ${message.member.user.tag} a été réinitialisé comme une création`)
                            })
                        }

                        // Supprimer les messages du bot au bout de 5 seconde si ils sont dans le salon création
                        if(message.channel.id === config.bot.discord.creation.channel) {
                            message.delete({timeout: 2000})
                            if(messageBot) messageBot.delete({timeout: 2000})
                        }
                    }
                }
        }
}