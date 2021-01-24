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
            voiceData.playlist = []
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
        delete voiceData.playlist
    }
}

exports.stopMusic = () => {
    if(voiceData.connexion.dispatcher)
    {
        voiceData.connexion.dispatcher.destroy()
    }
}

exports.endMusic = async () => {
    if(voiceData.connexion.dispatcher)
    {
        let next = voiceData.playlist[1]
        await voiceData.connexion.dispatcher.end()
        return next
    }
}


exports.addToPlaylist = async (link) => {
    let result = false
    if(this.isConnect() && this.youtubeUrlIsValide(link))
    {
        await ytdl.getInfo(link).then(async info => {
            let video = {}
            video.title =  info.videoDetails.title
            video.author = info.videoDetails.author
            video.time = info.videoDetails.lengthSeconds
            video.url = link
            voiceData.playlist.push(video)
            result = video
        })
    }
    return result
}

exports.getFirstMusic = () => {
    if(voiceData.playlist) return voiceData.playlist[0]
    else return null
}

exports.playYoutubeMusic = async () => {
    let result = null
    if(this.isConnect() && !this.haveMusic())
    {
        await voiceData.connexion.play(await ytdl(voiceData.playlist[0].url), { type: 'opus'})
        this.setVolume(voiceData.volume)
        result = voiceData.playlist[0]
        voiceData.connexion.dispatcher.on('finish', () => {
            voiceData.playlist.shift()
            if(voiceData.playlist.length > 0) this.playYoutubeMusic()
        })
    }
    return result
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

exports.pauseMusic = async () => {
    await voiceData.connexion.dispatcher.pause(true)
    return voiceData.playlist[0]
}

exports.resumeMusic = async () => {
    await voiceData.connexion.dispatcher.resume()
    return voiceData.playlist[0]
}