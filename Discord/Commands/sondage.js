const SondageManager = require('../../Discord/Class/SondageManager')
const SondageOption = require('../../Discord/Class/SondageOption')

config = require('../../config.json')

module.exports = {
    name: "sondage",
    description: "Gestion des sondage",
    syntax: "sondage [create|reset|post|end|...]",
    enable: true,
    argsRequire: false,
    role: "moderator",
    subCommands:
        {
            create:
                {
                    name: "create",
                    description: "Créer un sondage",
                    syntax: "sondage create <titre>",
                    options: [
                        {
                            name: "titre",
                            type: "STRING",
                            description: "Titre du sondage",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du titre du sondage
                        let title = interaction.options.getString('titre')

                        // Création du sondage
                        let result = SondageManager.initSondage(title)

                        // Informer l'utilisateur si le sondage à bien été créé
                        if(result) interaction.reply({content: `Le sondage *${title}* a bien été créé`})
                        else interaction.reply({content: `Le sondage n'a pas pu être créé, il est possible qu'un sondage sois déjà en cours de création`, ephemeral: true})
                    }
                },
            title:
                {
                    name: "title",
                    description: "Changer le titre du sondage en cours de création",
                    syntax: "sondage title <titre>",
                    options: [
                        {
                            name: "titre",
                            type: "STRING",
                            description: "Titre du sondage",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du titre du sondage en paramètre
                            let title = interaction.options.getString('titre')

                            // Changer le titre
                            sondage.setTitle(title)

                            // Informer l'utilisateur du changement de titre
                            interaction.reply({content: `Le sondage a bien été renommé : *${sondage.getTitle()}*`})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            description:
                {
                    name: "description",
                    description: "Changer la description du sondage en cours de création",
                    syntax: "sondage description <description>",
                    options: [
                        {
                            name: "description",
                            type: "STRING",
                            description: "Description du sondage",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du titre du sondage en paramètre
                            let description = interaction.options.getString('description')

                            // Changer le titre
                            sondage.setDescription(description)

                            // Informer l'utilisateur du changement de titre
                            interaction.reply({content: `La description du sondage à bien été changé en : *${sondage.getDescription()}*`})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            expire:
                {
                    name: "expire",
                    description: "Sélectionné la date d'expiration du sondage en cours de création",
                    syntax: "sondage expire <JJ-MM-AAAA> <HH:mm>",
                    options: [
                        {
                            name: "date",
                            type: "STRING",
                            description: `Date d'expiration au format "JJ-MM-AAAA"`,
                            required: true
                        },
                        {
                            name: "heure",
                            type: "STRING",
                            description: `Heure d'expiration au format "HH:mm"`,
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du jour, mois, année
                            let dmy = interaction.options.getString('date').split('-')
                            if(dmy.length < 3) return interaction.reply({content: 'Format de date incorrect', ephemeral: true})

                            let d = Number(dmy[0])
                            if(!Number.isInteger(d)) return interaction.reply({content: 'Jour incorrect', ephemeral: true})

                            let M = Number(dmy[1])
                            if(!Number.isInteger(M)) return interaction.reply({content: 'Mois incorrect', ephemeral: true})
                            M--

                            let Y = Number(dmy[2])
                            if(!Number.isInteger(Y)) return interaction.reply({content: 'Année incorrect', ephemeral: true})

                            // Récupération de l'heure
                            let heure = interaction.options.getString('heure').split(':')
                            if(heure.length < 2) return interaction.reply({content: `Format de l'heure incorrect`, ephemeral: true})

                            let h = Number(heure[0])
                            if(!Number.isInteger(h)) return interaction.reply({content: 'Heure incorrect', ephemeral: true})

                            let m = Number(heure[1])
                            if(!Number.isInteger(m)) return interaction.reply({content: 'Minute incorrect', ephemeral: true})

                            // Calcul de la date
                            let date = new Date(Y, M, d, h, m)
                            let now = new Date()

                            if(date.getTime() < (now.getTime() + 60000)) return interaction.reply({content: 'Délais expiré ou inférieure à 1 minute', ephemeral: true})

                            // Changer la date d'expiration
                            sondage.setExpireTime(date.getTime())

                            // Informer l'utilisateur du changement de titre
                            interaction.reply({content: `Le sondage expirera le : ${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} à ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            addoption:
                {
                    name: "addoption",
                    description: "Ajoute un choix au sondage en cours de création",
                    syntax: "sondage addOption <emote> <libelle>",
                    options: [
                        {
                            name: "emote",
                            type: "STRING",
                            description: "Emote du choix à ajouter au sondage",
                            required: true
                        },
                        {
                            name: "libelle",
                            type: "STRING",
                            description: "Libelle du choix à ajouter au sondage",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer la l'emote
                            let emote = interaction.options.getString('emote')

                            // Récupérer le libelle
                            let libelle = interaction.options.getString('libelle')

                            // Vérifier la présente d'un libellé
                            if(libelle.length < 1) return interaction.reply({content: `Aucune libellé n'a été fournit`, ephemeral: true})

                            // Ajoute de la réaction au sondage
                            sondage.addOption(new SondageOption(emote, libelle))

                            interaction.reply({content: `L'option *${emote} ${libelle}* a bien été ajouter au sondage en cours de création`})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            removeoption:
                {
                    name: "removeoption",
                    description: "retirer un choix au sondage en cours de création",
                    syntax: "sondage removeOption <emote>",
                    options: [
                        {
                            name: "emote",
                            type: "STRING",
                            description: "Emote du choix à supprimer",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer la l'emote
                            let emote = interaction.options.getString('emote')

                            // Récupéré l'option
                            let option = sondage.getOptionByEmote(emote)

                            // Supprimer l'option si elle a été trouvé
                            if(option) {
                                sondage.removeOption(option)
                                interaction.reply({content: `L'option *${option.getEmote()} ${option.getLibelle()}* a bien été retiré au sondage en cours de création`})
                            }
                            else interaction.reply({content: `L'option demandé est introuvable`, ephemeral: true})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            reset:
                {
                    name: "reset",
                    description: "Supprimer le sondage en cours de création",
                    syntax: "sondage reset",
                    enable: true,
                    argsRequire: false,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer le titre
                            let title = sondage.getTitle()

                            // Supprimer le sondage
                            SondageManager.removeCreationSondage()

                            // Informer l'utilisateur de la suppression du message
                            interaction.reply({content: `Le sondage en cours de création : *${title}*, à bien été supprimé`})
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            render:
                {
                    name: "render",
                    description: "Affiche un rendu du sondage en cours de création",
                    syntax: "sondage render",
                    enable: true,
                    argsRequire: false,
                    role: "moderator",
                    async execute(interaction) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer le embed
                            let embed = sondage.generateEmbed()

                            // Envoyé le rendu
                            interaction.reply({embeds: [embed]}).then(async () => {
                                /** @type {any} */
                                let message = await interaction.fetchReply()
                                sondage.getReact().forEach(emote => {
                                    message.react(emote)
                                })
                            })
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                        }
                    }
                },
            post:
                {
                    name: "post",
                    description: "Poster un sondage",
                    syntax: "sondage post <nom_salon>",
                    enable: true,
                    argsRequire: true,
                    options: [
                        {
                            name: "salon",
                            type: "CHANNEL",
                            description: "Nom du salon dans le quel le sondage doit être posté",
                            required: true
                        }
                    ],
                    role: "moderator",
                    async execute(interaction) {
                        let channel = interaction.options.getChannel('salon')

                        if(channel.isText()) {
                            // Récupération du sondage en cours de création
                            let creationSondage = SondageManager.getCreationSondage()
                            // Absence de sondage en cours de création
                            if(!creationSondage) return interaction.reply({content: 'Aucun sondage en cours de création', ephemeral: true})
                            // Absence de titre pour le sondage en cours de création
                            if(creationSondage.getTitle().length < 1) return interaction.reply({content: 'Titre manquant pour le sondage en cours de création', ephemeral: true})
                            // Absence de description pour le sondage en cours de création
                            if(creationSondage.getDescription().length < 1) return interaction.reply({content: 'Description manquant pour le sondage en cours de création', ephemeral: true})
                            // Option insuffisante pour le sondage en cours de création
                            if(creationSondage.getOptions().length < 2) return interaction.reply({content: 'Un minimum de 2 options et requis pour posté le sondage', ephemeral: true})
                            // Temps d'expiration insuffisant
                            let now = new Date()
                            if(creationSondage.getExpireTime() < (now.getTime() + 60000)) return interaction.reply({content: `Le délais d'expiration doit être d'au moins 1 minute pour posté le sondage`, ephemeral: true})

                            let post = SondageManager.postSondage(channel)

                            if(post) interaction.reply({content: `Le sondage *${creationSondage.getTitle()}* a bien été posté dans le salon *${channel.name}*`})
                            else interaction.reply({content: `Échec lors de la publication du sondage *${creationSondage.getTitle()}*`, ephemeral: true})
                        }
                        else return interaction.reply({content: "Le salon demandé est invalide", ephemeral: true})
                    }
                },
            end:
                {
                    name: "end",
                    description: "Mettre fin à un sondage",
                    syntax: "sondage end <id_message>",
                    options: [
                        {
                            name: "id",
                            type: "STRING",
                            description: "Id du message du sondage au quel vous souhaitez mettre fin",
                            required: true
                        }
                    ],
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(interaction) {
                        let sondage = SondageManager.getSondageByMessageId(interaction.options.getString('id'))

                        if(sondage) {
                            sondage.expire()
                            interaction.reply({content: `Fin du sondage *${sondage.getTitle()}*`})
                        } else interaction.reply({content: "Aucun sondage n'a été trouvé", ephemeral: true})
                    }
                },
            test:
                {
                    name: "test",
                    description: "créer un message de test",
                    syntax: "sondage test",
                    enable: true,
                    argsRequire: false,
                    role: "moderator",
                    async execute(interaction) {
                        // Création du sondage
                        let result = SondageManager.initSondage("Sondage de test")

                        // Informer l'utilisateur si le sondage à bien été créé
                        if(result) {
                            let sondage = SondageManager.getCreationSondage()
                            sondage.setDescription('Ceci est un sondage de test généré automatiquement par une commande')
                            sondage.addOption(new SondageOption('🔹', "Choix n°1"))
                            sondage.addOption(new SondageOption('🔸', "Choix n°2"))
                            interaction.reply({content: `Le sondage de test à bien été créé`})
                        }
                        else interaction.reply({content: `Le sondage n'a pas pu être créé, il est possible qu'un sondage sois déjà en cours de création`, ephemeral: true})
                    }
                }
        }
}