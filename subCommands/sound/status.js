const func = require('../../addon/fonction')
const Discord = require('discord.js')

module.exports = {
    name: 'status',
    parent: 'sound',
    description: "Optenir les informations sur l'etat du bot musique",
    guildOnly: true,
    args: false,
    usage: '',
    permition: [2],
    enable: true,
    async execute(message,args,db) {
        const {radioList} = message.client
        needConnect = false

        if(soundInfo.connection) salon = soundInfo.connection.channel.name
        else salon = "Aucun"

        if(soundInfo.status == 'off') status = 'Hors ligne'
        else status = soundInfo.status

        musicStatus = new Discord.RichEmbed()
            .setColor('#646464')
            .setTitle('Dynivers Musique')
            .setTimestamp()
            .setFooter('Dynivers, status musique')
            .addField('Status', status, true)
            .addField('Volume',soundInfo.volume*1000 + "%", true)
            .addField('Salon vocal',salon,false)
        
        if(soundInfo.status == 'radio')
        {
            rd = radioList.find(radio => radio.title == soundInfo.musicNow)

            musicStatus.setColor('#FC7C04')
            musicStatus.setThumbnail(rd.logo)
            musicStatus.addField('Radio',soundInfo.musicNow, true)
            musicStatus.addField(`Temps d'écoute`, func.msToTime(soundInfo.dispatcher.totalStreamTime),true)
        }
        else if (soundInfo.status == 'youtube')
        {
            musicStatus.setColor('#FC7C04')
            musicStatus.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/b/b2/YouTube_logo_%282013-2015%29.png')

            musicStatus.addField('Musique', soundInfo.ytbSounds[0].name, true)

            musicStatus.addField(`Temps d'écoute`, func.msToTime(soundInfo.dispatcher.totalStreamTime),true)
            
            playlist = []
            for (i = 0; i < soundInfo.ytbSounds.length; i++)
            {
                playlist.push(`${i+1}. ${soundInfo.ytbSounds[i].name}`)
                if((i >= 9) && (soundInfo.ytbSounds.length >= 14))
                {
                    playlist.push(`Et ${soundInfo.ytbSounds.length-10} autres musiques`)
                    i = soundInfo.ytbSounds.length
                }
            }
            playlistStr = playlist.join('\n')
            if(playlist.length > 1)
            {
                try
                {
                    musicStatus.addField('Playlist', playlistStr)
                }
                catch(error)
                {
                    message.channel.send('Erreur de la récupération du status, certaines informations n\'ont pas pu être envoyé')
                    func.log('err', `Status musique : ${error}`)
                }
            }
        }

        message.channel.send({embed: musicStatus})
       
    }
}