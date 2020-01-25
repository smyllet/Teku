const func = require('../../addon/fonction')

module.exports = {
    name: 'play',
    parent: 'sound',
    description: "Relancer la musique mise en pause (uniquement pour la musique youtube)",
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

        if(!soundInfo.dispatcher.paused) return message.channel.send("La musique n'est pas en pause")

        soundInfo.dispatcher.resume()

        message.channel.send(`La musique n'est plus en pause`)
    }
}