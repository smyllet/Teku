const func = require('../../addon/fonction')

module.exports = {
    name: 'stop',
    parent: 'sound',
    description: "Eteindre la musique",
    guildOnly: true,
    args: false,
    usage: '',
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

        soundInfo.connection.disconnect()

        message.channel.send(`La musique à été stoppé`)
    }
}