const func = require('../../addon/fonction')

module.exports = {
    name: 'radio',
    parent: 'sound',
    description: "La radio sur discord? Serieusement ?",
    guildOnly: true,
    args: true,
    usage: '<Nom de la radio>',
    aliases: ['r'],
    permition: [1],
    enable: true,
    async execute(message,args,db) {
        const {radioList} = message.client
        needConnect = false

        const { voiceChannel } = message.member
        if(!voiceChannel) return message.channel.send('Vous devez être connecté à un salon vocal')

        radio = radioList.get(args.join(' ').toUpperCase())

        if(soundInfo.connection)
        {
            if((soundInfo.connection.channel) != (voiceChannel)) return message.channel.send("Vous devez être connecté au même salon vocal que le bot pour contrôler la musique")
        }
        else needConnect = true

        if(radio)
        {
            if(needConnect) soundInfo.connection = await voiceChannel.join()
            soundInfo.status = 'radio'
            if(soundInfo.dispatcher) await soundInfo.dispatcher.end()
            soundInfo.dispatcher = null
            soundInfo.dispatcher = await soundInfo.connection.playStream(radio.url, {passes: 5})
            soundInfo.dispatcher.setVolumeLogarithmic(soundInfo.volume)
            soundInfo.musicNow = radio.title
            message.channel.send(`Lancement de la radio ${radio.title}`)
        }
        else message.channel.send(`Radio introuvable`)        
    }
}