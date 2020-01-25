const func = require('../../addon/fonction')
const ytdl = require('ytdl-core')
const ytlist = require('youtube-playlist')

module.exports = {
    name: 'youtube',
    parent: 'sound',
    description: "Jouer de la musique provenant de youtube",
    guildOnly: true,
    args: true,
    usage: '<lien youtube>',
    aliases: ['r'],
    permition: [7],
    enable: true,
    async execute(message,args,db) {
        needConnect = false

        const { voiceChannel } = message.member
        if(!voiceChannel) return message.channel.send('Vous devez être connecté à un salon vocal')

        msc = ytdl.validateURL(args[0])

        if(soundInfo.connection)
        {
            if((soundInfo.connection.channel) != (voiceChannel)) return message.channel.send("Vous devez être connecté au même salon vocal que le bot pour contrôler la musique")
        }
        else needConnect = true

        async function play(url)
        {
            soundInfo.musicNow = soundInfo.ytbSounds[0].name
            soundInfo.status = 'youtube'
            if(soundInfo.dispatcher) await soundInfo.dispatcher.end()
            soundInfo.dispatcher = null
            soundInfo.dispatcher = await soundInfo.connection.playStream(ytdl(url,{filter: "audioonly"}), {passes: 5})
            soundInfo.dispatcher.setVolumeLogarithmic(soundInfo.volume)

            soundInfo.dispatcher
            .on('end', () => {
                if(soundInfo.status != 'youtube') return
                soundInfo.ytbSounds.shift()
                if(soundInfo.ytbSounds.length >= 1)
                {
                    soundInfo.dispatcher = null
                    play(soundInfo.ytbSounds[0].url)
                }
                else soundInfo.connection.disconnect()
            })
            .on('debug', debug => {
                console.log(debug)
            })
            .on('error', error => {
                func.log('err',`erreur : ${error}`)
                try
                {
                    message.channel.send("Erreur lors de l'exécution de la musique")
                    soundInfo.connection.disconnect()
                }
                catch
                {
                    console.error()
                }
            })
        }

        async function playMusic(url,fromPlaylist)
        {
            ytdl.getInfo(url, async (err, musiqueInfo) =>
            {
                if(err) return func.log('err',`Erreur musique youtube : ${err}`)
                if(needConnect) soundInfo.connection = await voiceChannel.join()
                if(soundInfo.ytbSounds.length < 1)
                {
                    soundInfo.ytbSounds.push({name: musiqueInfo.title, url: url, author: musiqueInfo.author.name})
                    play(url)
                    message.channel.send(`Lancement de la musique`)
                    needConnect = false
                }
                else
                {
                    soundInfo.ytbSounds.push({name: musiqueInfo.title, url: url, author: musiqueInfo.author.name})
                    if(!fromPlaylist) message.channel.send(`Musique ajouté à la liste de lecture`)
                    if(soundInfo.status != 'youtube') play(soundInfo.ytbSounds[0].url)
                }
            })
        }

        if(msc) playMusic(args[0])
        else
        {
            ytlist(args[0], 'url')
            .then(async res => {
                if(res.data.playlist.length > 0)
                {
                    if(needConnect)
                    {
                        soundInfo.connection = await voiceChannel.join()
                        needConnect = false
                    }

                    if(soundInfo.ytbSounds.length < 1)
                    {
                        soundd = res.data.playlist.shift()
                        ytdl.getInfo(soundd, async (err, musiqueInfo) =>
                        {
                            if(err) return func.log('err',`Erreur musique youtube : ${err}`)
                            soundInfo.ytbSounds.push({name: musiqueInfo.title, url: soundd, author: musiqueInfo.author.name})
                            
                            play(soundd)
                            message.channel.send(`Lancement de la musique`)

                            for (var url of res.data.playlist)
                            {
                                if(ytdl.validateURL(url))
                                {
                                    await ytdl.getInfo(url, async (err, musiqueInfo) =>
                                    {
                                        if(err) return func.log('err',`Erreur musique youtube : ${err}`)
                                        soundInfo.ytbSounds.push({name: musiqueInfo.title, url: musiqueInfo.video_url, author: musiqueInfo.author.name})
                                    })
                                }
                            }
                            
                        })
                    }
                    else for (var url of res.data.playlist)
                    {
                        if(ytdl.validateURL(url))
                        {
                            await ytdl.getInfo(url, async (err, musiqueInfo) =>
                            {
                                if(err) return func.log('err',`Erreur musique youtube : ${err}`)
                                soundInfo.ytbSounds.push({name: musiqueInfo.title, url: musiqueInfo.video_url, author: musiqueInfo.author.name})
                            })
                        }
                    }
                }
                else return message.channel.send('Lien invalide')
            })
            .catch(err => {
                func.log('warn', err)
            })
        }      
    }
}