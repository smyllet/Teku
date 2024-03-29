// Import config
config = require('../../config.json')

// Import module
const soundManager = require('../discordBotModule/soundManager')
const logs = require('../../Global/module/logs')
const Discord = require('discord.js')
const youtubeSearch = require('youtube-search-api')
const urlParser = require('url-parse');

/** @param {string} url */
function getListIdFromYoutubeUrl(url) {
    let up = urlParser(url)

    if(((up.hostname === "youtube.com") || (up.hostname === "www.youtube.com")) && up.query && (up.query.length > 0)) {

        let query = up.query.substr(1)

        let queryList = query.split('&')

        let queryValue = {}

        queryList.forEach(q => {
            let qs = q.split('=')
            if(qs.length === 2) queryValue[qs[0]] = qs[1]
        })

        return queryValue.list
    } return null
}

module.exports = {
    name: "music",
    description: "Commande de gestion de la musique",
    syntax: "music [play|stop|off|volume|pause|resume|skip]",
    enable: false,
    argsRequire: false,
    role: "everyone",
    subCommands:
        {
            play:
                {
                    name: "play",
                    description: "Lire une musique ou une playlist depuis un lien youtube ou par son nom",
                    syntax: "music play (lien youtube | nom d'une musique)",
                    enable: true,
                    argsRequire: true,
                    role: "everyone",
                    async execute(message, args) {
                        if(!message.member.voice.channel) return message.channel.send("Seul les personnes connecté en vocal sont autorisé à jouer de la musique")
                        if(soundManager.isConnect() && !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send("Désolé, mais il semblerais que le bot sois déjà connecté dans un autre salon")

                        let url = args[0]
                        let playlist = getListIdFromYoutubeUrl(url)

                        if(!soundManager.youtubeUrlIsValide(url) || playlist) {
                            let search = args.join(' ')

                            if(playlist) {
                                let result = await youtubeSearch.GetPlaylistData(playlist)
                                let musics = result.items.filter(m => m.isLive === false).map((mf) => `https://www.youtube.com/watch?v=${mf.id}`)

                                if(musics.length > 0) {
                                    if(!soundManager.isConnect()) await soundManager.connectToVocalChannel(message.member.voice.channel)

                                    let first = musics.shift()

                                    /** @type Message */
                                    let loadMessage = await message.channel.send(`Ajout en cours de la playlist : ${result.metadata.playlistMetadataRenderer.title}`)

                                    await soundManager.addToPlaylist(first).then(() => {
                                        setTimeout(async () => {
                                            for(let link of musics) {
                                                await soundManager.addToPlaylist(link)
                                            }

                                            await loadMessage.edit(`Ajout de "${musics.length+1}" musiques à la liste de lecture`)
                                        })
                                    }).catch(console.error)
                                } else message.channel.send("Aucune musique correspondante")

                            } else {
                                try {
                                    let result = await youtubeSearch.GetListByKeyword(search, false)

                                    if(result.items) {
                                        result = result.items.filter(m => m.isLive === false)
                                        if(result.length > 0) url = `https://www.youtube.com/watch?v=${result[0].id}`
                                    }
                                } catch (err) {
                                    return logs.err('Recherche musique : ' + err)
                                }
                            }
                        }

                        if(!soundManager.youtubeUrlIsValide(url) && !playlist) return message.channel.send("Aucune musique correspondante")

                        if(!soundManager.isConnect()) await soundManager.connectToVocalChannel(message.member.voice.channel)

                        if(!playlist) {
                            let addResult = await soundManager.addToPlaylist(url)

                            if(addResult) {
                                if(soundManager.haveMusic()) return message.channel.send(`Ajout de "${addResult.title}" à la liste de lecture`)
                            }
                            else message.channel.send("Échec de l'ajout de la musique à la liste de lecture")
                            if(addResult.url !== soundManager.getFirstMusic().url) message.channel.send(`Ajout de "${addResult.title}" à la liste de lecture`)
                        }

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
                            message.channel.send("Musique arrêtée")
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
                    role: "everyone",
                    async execute(message, args) {
                        if(!soundManager.isConnect()) return message.channel.send("Oups, il semblerais que le bot ne sois pas connecté")
                        if(!message.member.voice.channel || !soundManager.isInChannel(message.member.voice.channel)) return message.channel.send('Seul les personnes connecté en vocal dans le même salon que le bot sont autorisé à changer le volume de la musique')

                        let exVolume = soundManager.getVolume()

                        let volume = Number(args[0])

                        if((volume < 0) || (volume > 100) || !Number.isInteger(volume)) return message.channel.send("Le volume fournie est invalide, il doit être entre 0% et 100%")

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
                    role: "everyone",
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
                    role: "everyone",
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
                    role: "everyone",
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
                    role: "everyone",
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