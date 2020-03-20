const func = require('../../addon/fonction')

module.exports = {
    name: 'radio-back',
    parent: 'sound',
    description: "Permet de basculer automatiquement sur la radio quand la playlist youtube en cours touche à sa fin",
    guildOnly: true,
    args: false,
    usage: '[Nom de la radio] (efface la radio automatique si aucune radio n\'est présisé)',
    aliases: ['rb'],
    permition: [1],
    enable: true,
    async execute(message,args,db) {
        const {radioList} = message.client
        
        if(!soundInfo.connection)
        {
            soundInfo.status = 'off'
            return message.channel.send(`Le bot n'est pas connecté`)
        }
        
        const { voiceChannel } = message.member
        if((!voiceChannel) || (voiceChannel != soundInfo.connection.channel)) return message.channel.send(`Vous devez être connecté au même salon vocal que le bot pour contrôler la musique`)


        if((!args[0]) || (args==""))
        {
            soundInfo.radioBack = null
            return message.channel.send(`La radio automatique à été suprimé`)
        }
        radio = radioList.get(args.join(' ').toUpperCase())
        
        if(radio)
        {
            soundInfo.radioBack = args.join(' ')
            message.channel.send(`La radio ${radio.title} sera jouer à chaque fois que la playlist youtube en cours touchera à sa fin`)
        }
        else message.channel.send(`Radio introuvable`)        
    }
}