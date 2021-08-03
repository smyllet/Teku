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
                    options: [
                        {
                            name: "id",
                            type: "STRING",
                            description: "Id du message à définir comme création",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        let id = interaction.options.getString("id")

                        // Récupérer le message demandé en arguments
                        let creation = interaction.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(id)

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) await interaction.reply({content: `Aucun message portant cet id n'a été trouvé dans le salon ${interaction.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`, ephemeral: true})
                        // Sinon si le message est épinglé
                        else if(creation.pinned) {
                            // Avertir l'utilisateur que le message est déjà une création
                            await interaction.reply({content: 'Ce message est déjà défini comme création, il peux être réinitialisé avec la commande `creation reset <id_message>`', ephemeral: true})
                        }
                        // Sinon
                        else {
                            // Initialisé le message comme une création
                            await creationManager.initCreationMessage(creation).then(async () => {
                                await interaction.reply({content: `Le message de ${creation.member.user.tag} à bien été défini comme création`, ephemeral: true})
                            })
                        }
                    }
                },
            cancel:
                {
                    name: "cancel",
                    description: "Retiré un message comme création",
                    syntax: "creation cancel <id_message>",
                    options: [
                        {
                            name: "id",
                            type: "STRING",
                            description: "Id du message de la création à retirer",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        let id = interaction.options.getString("id")

                        // Récupérer le message demandé en arguments
                        let creation = interaction.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(id)

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) await interaction.reply({content: `Aucun message portant cet id n'a été trouvé dans le salon ${interaction.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`, ephemeral: true})
                        // Sinon si le message n'est pas épinglé
                        else if(!creation.pinned) {
                            // Avertir l'utilisateur que le message n'est pas une création
                            await interaction.reply({content: `Ce message n'est pas une création`, ephemeral: true})
                        }
                        // Sinon
                        else {
                            // Annulé le message comme création
                            await creationManager.cancelCreationMessage(creation).then(async () => {
                                await interaction.reply({content: `Le message de ${interaction.member.user.tag} n'est plus une création`, ephemeral: true})
                            })
                        }
                    }
                },
            reset:
                {
                    name: "reset",
                    description: "Réinitialisé un message comme création",
                    syntax: "creation reset <id_message>",
                    options: [
                        {
                            name: "id",
                            type: "STRING",
                            description: "Id du message de la création à réinitialiser",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        let id = interaction.options.getString("id")

                        // Récupérer le message demandé en arguments
                        let creation = interaction.guild.channels.cache.get(config.bot.discord.creation.channel).messages.cache.get(id)

                        // Si aucune création n'a été récupéré, avertir l'utilisateur
                        if(!creation) await interaction.reply({content: `Aucun message portant cet id n'a été trouvé dans le salon ${interaction.guild.channels.cache.get(config.bot.discord.creation.channel).toString()}`, ephemeral: true})
                        // Sinon si le message n'est pas épinglé
                        else if(!creation.pinned) {
                            // Avertir l'utilisateur que le message n'est pas une création
                            await interaction.reply({content: `Ce message n'est pas une création`, ephemeral: true})
                        }
                        // Sinon
                        else {
                            // Réinitialisé le message comme création
                            await creationManager.resetCreationMessage(creation).then(async () => {
                                await interaction.reply({content: `Le message de ${interaction.member.user.tag} a été réinitialisé comme une création`, ephemeral: true})
                            })
                        }
                    }
                }
        }
}