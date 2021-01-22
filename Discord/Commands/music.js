// Import config
config = require('../../config.json')

// Import module
const soundManager = require('../discordBotModule/soundManager')


module.exports = {
    name: "music",
    description: "Commande de gestion de la musique",
    syntax: "music [play|stop|off|volume]",
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

                        soundManager.playYoutubeLink(url).then(() => {
                            soundManager.getInfoForYoutubeUrl(url).then(info => {
                                message.channel.send(`Lecture de ${info.videoDetails.title}`)
                            })
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
                    syntax: "music volume (volume souhaité de 1 à 100, par défaut à 16)",
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
                }
        }
}