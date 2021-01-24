// Import config
config = require('../../config.json')

// Import module
const soundManager = require('../discordBotModule/soundManager')
const Discord = require('discord.js')


module.exports = {
    name: "music",
    description: "Commande de gestion de la musique",
    syntax: "music [play|stop|off|volume|pause|resume|skip]",
    enable: true,
    argsRequire: false,
    role: "vip",
    subCommands:
        {
            play:
                {
                    name: "play",
                    description: "Lire une musique depuis un lien youtube",
                    syntax: "music play (lien youtube)",
                    enable: true,
                    argsRequire: true,
                    role: "vip",
                    async execute(message, args) {
                        if(!message.member.voice.channel) return message.channel.send("Seul les personnes connecté en vocal sont autorisé à jouer de la musique")
                        if(soundManager.isConnect() && !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send("Désolé, mais il semblerais que le bot sois déjà connecté dans un autre salon")

                        let url = args[0]

                        if(!soundManager.youtubeUrlIsValide(url)) return message.channel.send("Le lien que vous avez fourni est invalide")

                        if(!soundManager.isConnect()) await soundManager.connectToVocalChannel(message.member.voice.channel)

                        let addResult = await soundManager.addToPlaylist(url)

                        if(addResult) {
                            if(soundManager.haveMusic()) return message.channel.send(`Ajout de "${addResult.title}" à la liste de lecture`)
                        }
                        else message.channel.send("Echec de l'ajout de la musique à la liste de lecture")
                        if(addResult.url !== soundManager.getFirstMusic().url) message.channel.send(`Ajout de "${addResult.title}" à la liste de lecture`)
                        soundManager.playYoutubeMusic().then(r => {
                            if(r) message.channel.send(`Lecture de la musique "${r.title}"`)
                        })
                    }
                },
            stop:
                {
                    name: "stop",
                    description: "Arrêter la musique en cours de lecture",
                    syntax: "music stop",
                    enable: true,
                    argsRequire: false,
                    role: "everyone",
                    async execute(message) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à arrêter la musique')
                        if(soundManager.haveMusic()) {
                            soundManager.stopMusic()
                            message.channel.send("Musique arrêté")
                        }
                        else
                        {
                            message.channel.send("Aucune musique en cours de lecture")
                        }
                    }
                },
            off:
                {
                    name: "off",
                    description: "Déconnecte le bot du salon vocal",
                    syntax: "music off",
                    enable: true,
                    argsRequire: false,
                    role: "everyone",
                    async execute(message) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à déconnecter le bot')
                        soundManager.disconnect()
                        message.channel.send("Bot déconnecté")
                    }
                },
            volume:
                {
                    name: "volume",
                    description: "Changer le volume de la musique",
                    syntax: "music volume (volume souhaité de 1 à 100, par défaut à 20)",
                    enable: true,
                    argsRequire: true,
                    role: "vip",
                    async execute(message, args) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à changer le volume de la musique')

                        let exVolume = soundManager.getVolume()
                        let volume = args[0]

                        if((volume < 0) || (volume > 100)) return message.channel.send("Le volume fournie est invalide, il doit être entre 0% et 100%")

                        soundManager.setVolume(volume)

                        if(exVolume > volume) message.channel.send(`Le volume a été diminué de ${exVolume - volume}%, il est maintenant à ${volume}%`)
                        else if(exVolume < volume) message.channel.send(`Le volume a été augmenté de ${volume - exVolume}%, il est maintenant à ${volume}%`)
                        else message.channel.send(`Le volume est déjà à ${volume}%`)
                    }
                },
            pause:
                {
                    name: "pause",
                    description: "Mettre en pause la musique en cours de lecture",
                    syntax: "music pause",
                    enable: true,
                    argsRequire: false,
                    role: "vip",
                    async execute(message) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à mettre en pause la musique')
                        if(soundManager.haveMusic()) {
                            if(soundManager.isPaused())
                            {
                                message.channel.send("La musique est déjà en pause")
                            }
                            else {
                                soundManager.pauseMusic().then((info) => message.channel.send(`Mise en pause de "${info.title}"`))
                            }
                        }
                        else
                        {
                            message.channel.send("Aucune musique en cours de lecture")
                        }
                    }
                },
            resume:
                {
                    name: "resume",
                    description: "reprendre la musique actuellement en pause",
                    syntax: "music resume",
                    enable: true,
                    argsRequire: false,
                    role: "vip",
                    async execute(message) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à relancer la musique')
                        if(soundManager.haveMusic()) {
                            if(soundManager.isPaused())
                            {
                                soundManager.resumeMusic().then((info) => message.channel.send(`Reprise de "${info.title}"`))
                            }
                            else message.channel.send("La musique n'est pas en pause")
                        }
                        else if(soundManager.isConnect() && soundManager.getFirstMusic())
                        {
                            soundManager.playYoutubeMusic().then(info => {
                                if(info) message.channel.send(`Lecture de la musique "${info.title}"`)
                            })
                        }
                        else
                        {
                            message.channel.send("Aucune musique à reprendre")
                        }
                    }
                },
            skip:
                {
                    name: "skip",
                    description: "Passer à la musique suivante",
                    syntax: "music skip",
                    enable: true,
                    argsRequire: false,
                    role: "vip",
                    async execute(message) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à changer de musique')
                        if(soundManager.haveMusic()) {
                            soundManager.endMusic().then((next) => {
                                if(next) message.channel.send(`Musique passé, lecture de "${next.title}"`)
                                else message.channel.send(`Musique passé, aucune musique à lire dans la liste de lecture`)
                            })
                        }
                        else message.channel.send("Aucune musique en cours de lecture")
                    }
                },
            status:
                {
                    name: "status",
                    description: "Obtenir les informations sur le bot",
                    syntax: "music status",
                    enable: true,
                    argsRequire: false,
                    role: "vip",
                    async execute(message) {
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`Teku - Musique`)

                        if(soundManager.isConnect())
                        {
                            embed.setColor('#07396B')
                            embed.addField("Status", "Connecté", true)
                            embed.addField("Salon", soundManager.getChannel().name, true)
                            if(soundManager.isInChannel(message.member.voice.channel))
                            {
                                embed.addField("Volume",soundManager.getVolume() + '%')

                                embed.addField("En cours de lecture", (soundManager.haveMusic()) ? soundManager.getFirstMusic().title : "Aucune", true)
                                embed.addField("En pause", (soundManager.isPaused()) ? "Oui" : "Non", true)

                                let playlist = soundManager.getMusicPlaylist()
                                if(playlist) {
                                    let list = []
                                    let reste = 0
                                    playlist.forEach(video => {
                                        if(list.length <= 10) list.push(` - ${video.title}`)
                                        else reste++
                                    })
                                    if(reste > 0) list.push(`et ${reste} autre${(reste > 1) ? "s" : ""}`)
                                    embed.addField("Playlist", list.join("\n"))
                                }
                            }
                            else embed.setDescription("Vous devez être connecté dans le même salon que le bot pour obtenir la totalité des informations")
                        }
                        else
                        {
                            embed.setColor('#848484')
                            embed.addField("Status", "Déconnecté")
                        }

                        await message.channel.send({embed:embed})
                    }
                }
        }
}