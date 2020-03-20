const func = require('../../addon/fonction')

module.exports = {
    name: 'volume',
    parent: 'sound',
    description: "Changé le volume de la musique",
    guildOnly: true,
    args: true,
    usage: '<Volume entre 1 et 100>',
    aliases: ['v'],
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

        if(isNaN(args[0]) || (args[0] > 100) || (args[0] < 1)) return message.channel.send(`Le volume doit être compris entre 1 et 100`)
        
        vol = args[0]/100
        soundInfo.volume = vol
        soundInfo.dispatcher.setVolumeLogarithmic(vol)

        message.channel.send(`Le volume de la musique à été mis à ${args[0]}`)
    }
}