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
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du titre du sondage
                        let title = args.join(' ')

                        // Création du sondage
                        let result = SondageManager.initSondage(title)

                        // Informer l'utilisateur si le sondage à bien été créé
                        if(result) message.channel.send(`Le sondage *${title}* a bien été créé`)
                        else message.channel.send(`Le sondage n'a pas pu être créé, il est possible qu'un sondage sois déjà en cours de création`)
                    }
                },
            title:
                {
                    name: "title",
                    description: "Changer le titre du sondage en cours de création",
                    syntax: "sondage title <titre>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du titre du sondage en paramètre
                            let title = args.join(' ')

                            // Changer le titre
                            sondage.setTitle(title)

                            // Informer l'utilisateur du changement de titre
                            message.channel.send(`Le sondage a bien été renommé : *${sondage.getTitle()}*`)
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
                        }
                    }
                },
            description:
                {
                    name: "description",
                    description: "Changer la description du sondage en cours de création",
                    syntax: "sondage description <description>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du titre du sondage en paramètre
                            let description = args.join(' ')

                            // Changer le titre
                            sondage.setDescription(description)

                            // Informer l'utilisateur du changement de titre
                            message.channel.send(`Le sondage a bien été renommé : *${sondage.getDescription()}*`)
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
                        }
                    }
                },
            expire:
                {
                    name: "expire",
                    description: "Sélectionné la date d'expiration du sondage en cours de création",
                    syntax: "sondage expire <JJ-MM-AAAA> <HH:mm>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupération du jour, mois, année
                            let dmy = args[0].split('-')
                            if(dmy.length < 3) return message.channel.send('Format de date incorrect')

                            let d = Number(dmy[0])
                            if(!Number.isInteger(d)) return message.channel.send('Jour incorrect')

                            let M = Number(dmy[1])
                            if(!Number.isInteger(M)) return message.channel.send('Mois incorrect')
                            M--

                            let Y = Number(dmy[2])
                            if(!Number.isInteger(Y)) return message.channel.send('Année incorrect')

                            // Récupération de l'heure
                            if(args < 2) return message.channel.send('Heure manquante')
                            let heure = args[1].split(':')
                            if(heure.length < 2) return message.channel.send(`Format de l'heure incorrect`)

                            let h = Number(heure[0])
                            if(!Number.isInteger(h)) return message.channel.send('Heure incorrect')

                            let m = Number(heure[1])
                            if(!Number.isInteger(m)) return message.channel.send('Minute incorrect')

                            // Calcul de la date
                            let date = new Date(Y, M, d, h, m)
                            let now = new Date()

                            if(date.getTime() < (now.getTime() + 60000)) return message.channel.send('Délais expiré ou inférieure à 1 minute')

                            // Changer la date d'expiration
                            sondage.setExpireTime(date.getTime())

                            // Informer l'utilisateur du changement de titre
                            message.channel.send(`Le sondage expirera le : ${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} à ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`)
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
                        }
                    }
                },
            addoption:
                {
                    name: "addoption",
                    description: "Ajoute un choix au sondage en cours de création",
                    syntax: "sondage addOption <emote> <libelle>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer la l'emote
                            let emote = args[0]

                            // Récupérer le libelle
                            await args.shift()
                            let libelle = args.join(' ')

                            // Vérifier la présente d'un libellé
                            if(libelle.length < 1) return message.channel.send(`Aucune libellé n'a été fournit`)

                            // Testé la validité de l'emote
                            message.react(emote).then((react) => {
                                // Supprimé la réaction
                                react.remove()

                                // Ajoute de la réaction au sondage
                                sondage.addOption(new SondageOption(emote, libelle))

                                message.channel.send(`L'option *${emote} ${libelle}* a bien été ajouter au sondage en cours de création`)
                            }).catch(() => message.channel.send(`L'emote fournit est invalide ou indisponible pour le bot`))
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
                        }
                    }
                },
            removeoption:
                {
                    name: "removeoption",
                    description: "retirer un choix au sondage en cours de création",
                    syntax: "sondage removeOption <emote>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer la l'emote
                            let emote = args[0]

                            // Récupéré l'option
                            let option = sondage.getOptionByEmote(emote)

                            // Supprimer l'option si elle a été trouvé
                            if(option) {
                                sondage.removeOption(option)
                                message.channel.send(`L'option *${option.getEmote()} ${option.getLibelle()}* a bien été retiré au sondage en cours de création`)
                            }
                            else message.channel.send(`L'option demandé est introuvable`)
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
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
                    async execute(message) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer le titre
                            let title = sondage.getTitle()

                            // Supprimer le sondage
                            SondageManager.removeCreationSondage()

                            // Informer l'utilisateur de la suppression du message
                            message.channel.send(`Le sondage en cours de création : *${title}*, à bien été supprimé`)
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
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
                    async execute(message) {
                        // Récupération du sondage en cours de création
                        let sondage = SondageManager.getCreationSondage()

                        // Si il y a bien un sondage en cours de création
                        if(sondage) {
                            // Récupérer le embed
                            let embed = sondage.generateEmbed()

                            // Envoyé le rendu
                            message.channel.send(embed).then(message => {
                                sondage.getReact().forEach(emote => {
                                    message.react(emote)
                                })
                            })
                        }
                        else {
                            // Informer l'utilisateur qu'aucun sondage n'est en cours de création
                            message.channel.send('Aucun sondage en cours de création')
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
                    role: "moderator",
                    async execute(message, args) {
                        let channelName = args.join('-')
                        let channel = message.guild.channels.cache.find(channel => (channel.name === channelName) && (channel.type === "text"))

                        if(channel) {
                            // Récupération du sondage en cours de création
                            let creationSondage = SondageManager.getCreationSondage()
                            // Absence de sondage en cours de création
                            if(!creationSondage) return message.channel.send('Aucun sondage en cours de création')
                            // Absence de titre pour le sondage en cours de création
                            if(creationSondage.getTitle().length < 1) return message.channel.send('Titre manquant pour le sondage en cours de création')
                            // Absence de description pour le sondage en cours de création
                            if(creationSondage.getDescription().length < 1) return message.channel.send('Description manquant pour le sondage en cours de création')
                            // Option insuffisante pour le sondage en cours de création
                            if(creationSondage.getOptions().length < 2) return message.channel.send('Un minimum de 2 options et requis pour posté le sondage')
                            // Temps d'expiration insuffisant
                            let now = new Date()
                            if(creationSondage.getExpireTime() < (now.getTime() + 60000)) return message.channel.send(`Le délais d'expiration doit être d'au moins 1 minute pour posté le sondage`)

                            let post = SondageManager.postSondage(channel)

                            if(post) message.channel.send(`Le sondage *${creationSondage.getTitle()}* a bien été posté dans le salon *${channel.name}*`)
                            else message.channel.send(`Échec lors de la publication du sondage *${creationSondage.getTitle()}*`)
                        }
                        else return message.channel.send("Le salon demandé est introuvable")
                    }
                },
            end:
                {
                    name: "end",
                    description: "Mettre fin à un sondage",
                    syntax: "sondage end <id_message>",
                    enable: true,
                    argsRequire: true,
                    role: "moderator",
                    async execute(message, args) {
                        let sondage = SondageManager.getSondageByMessageId(args.join())

                        if(sondage) {
                            sondage.expire()
                            message.channel.send(`Fin du sondage *${sondage.getTitle()}*`)
                        } else message.channel.send("Aucun sondage n'a été trouvé")
                    }
                },
            test:
                {
                    name: "test",
                    description: "créer un message de test",
                    syntax: "sondage test",
                    enable: false,
                    argsRequire: false,
                    role: "moderator",
                    async execute(message) {
                        // Création du sondage
                        let result = SondageManager.initSondage("Sondage de test")

                        // Informer l'utilisateur si le sondage à bien été créé
                        if(result) {
                            let sondage = SondageManager.getCreationSondage()
                            sondage.setDescription('Ceci est un sondage de test généré automatiquement par une commande')
                            sondage.addOption(new SondageOption('🔹', "Choix n°1"))
                            sondage.addOption(new SondageOption('🔸', "Choix n°2"))
                            message.channel.send(`Le sondage de test à bien été créé`)
                        }
                        else message.channel.send(`Le sondage n'a pas pu être créé, il est possible qu'un sondage sois déjà en cours de création`)
                    }
                }
        }
}