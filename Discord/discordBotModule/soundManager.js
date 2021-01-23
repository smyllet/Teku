// Import config
config = require('../../config.json')

const logs = require('../../Global/module/logs')
const ytdl = require('ytdl-core-discord')

voiceData = {}

exports.init = () => {
    voiceData.volume = config.bot.discord.music.defaultVolume
}

exports.connectToVocalChannel = async (channel) => {
    voiceData.volume = config.bot.discord.music.defaultVolume

    await channel.join()
        .then(connection => {
            voiceData.connexion = connection
            logs.info("Connexion au salon vocal " + channel.name)
        })
        .catch(error => {
            logs.err(error.toString())
        })
}

exports.disconnect = () => {
    if(voiceData.connexion)
    {
        voiceData.connexion.disconnect()
        delete voiceData.connexion
    }
}

exports.stopMusic = () => {
    if(voiceData.connexion.dispatcher)
    {
        voiceData.connexion.dispatcher.destroy()
    }
}

exports.playYoutubeLink = async (link) => {
    if(this.isConnect())
    {
        if(this.youtubeUrlIsValide(link))
        {
            voiceData.connexion.play(await ytdl(link), { type: 'opus'})
            this.setVolume(voiceData.volume)
        }
    }
}

exports.isConnect = () => {
    if(voiceData.connexion) {
        if(voiceData.connexion.status === 0) return true
        else {
            if(voiceData.connexion.status === 4) delete voiceData.connexion
            return false
        }
    }
    else return false
}

exports.isInChannel = (channel) => {
    return this.isConnect() && (voiceData.connexion.channel === channel);
}

exports.youtubeUrlIsValide = (link) => {
    return (ytdl.validateURL(link) && ytdl.validateID(ytdl.getVideoID(link)))
}

exports.getInfoForYoutubeUrl = async (link) => {
    return ytdl.getInfo(link)
}

exports.setVolume = (volume) => {
    if(this.isConnect())
    {
        voiceData.volume = volume
        if(this.haveMusic())
        {
            voiceData.connexion.dispatcher.setVolumeLogarithmic(volume/200)
        }
    }
}

exports.getVolume = () => {
    return voiceData.volume
}

exports.vocalMemberUpdate = (channel) => {
    if(voiceData.connexion)
    {
        if(this.isInChannel(channel))
        {
            channel.fetch().then(channel => {
                if(channel.members.size <= 1) {
                    voiceData.autoDeco = setTimeout(() => {
                        this.disconnect()
                    }, config.bot.discord.music.autoDecoDelay)
                }
                else if(voiceData.autoDeco)
                {
                    clearTimeout(voiceData.autoDeco)
                    delete voiceData.autoDeco
                }
            })
        }
    }
}

exports.haveMusic = () => {
    return voiceData.connexion.dispatcher != null
}

exports.isPaused = () => {
    return voiceData.connexion.dispatcher && voiceData.connexion.dispatcher.paused
}

exports.pauseMusic = () => {
    voiceData.connexion.dispatcher.pause(true)
}

