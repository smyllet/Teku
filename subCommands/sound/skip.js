const func = require('../../addon/fonction')

module.exports = {
    name: 'skip',
    parent: 'sound',
    description: "Passer à la musique suivante (uniquement pour la musique youtube)",
    guildOnly: true,
    args: false,
    usage: '',
    aliases: ['s'],
    permition: [1],
    enable: true,
    async execute(message,args,db) {
        if(!soundInfo.connection)
        {
            soundInfo.status = 'off'
            return message.channel.send(`Le bot n'est pas connecté`)
        }
        
        const { voiceChannel } = message.member
        if((!voiceChannel) || (voiceChannel != soundInfo.connection.channel)) return message.channel.send(`Vous devez être connecté au même salon vocal que le bot pour contrôler la musique`)

        if(soundInfo.status != 'youtube') return message.channel.send(`La musique ne peut être skip que on mode youtube`)
        
        soundInfo.dispatcher.end()
    }
}