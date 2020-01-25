const func = require('../../addon/fonction')

module.exports = {
    name: 'pause',
    parent: 'sound',
    description: "Mettre la musique sur pause (uniquement pour la musique youtube)",
    guildOnly: true,
    args: false,
    usage: '',
    permition: [7],
    enable: true,
    async execute(message,args,db) {
        if(!soundInfo.connection)
        {
            soundInfo.status = 'off'
            return message.channel.send(`Le bot n'est pas connecté`)
        }
        
        const { voiceChannel } = message.member
        if((!voiceChannel) || (voiceChannel != soundInfo.connection.channel)) return message.channel.send(`Vous devez être connecté au même salon vocal que le bot pour contrôler la musique`)

        if(soundInfo.status != 'youtube') return message.channel.send(`La musique ne peut être mis en pause que on mode youtube`)

        soundInfo.dispatcher.pause()

        message.channel.send(`La musique à été mis en pause`)
    }
}