const func = require('../addon/fonction')

module.exports = {
    name: 'unmute',
    description: "démute un jour dans tout les tchats du serveur",
    cat: 'Modération',
    guildOnly: true,
    args: true,
    usage: '<@pseudo>',
    permition: [7],
    enable: true,
    execute(message,args,db,permitionUser) {
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Merci d'entrer un nom d'utilisateur")
        let Mute = member.guild.roles.find(grade => grade.name == "Mute")
        if (!member.roles.has(Mute.id)) return message.channel.send("ce membre n'est pas mute")
        if (member.id === message.author.id) return message.channel.send("Ah t'es mute ? Et bah tu va le rester")
        member.removeRole(Mute)
        message.channel.send(member.displayName + " a bien été unmute")        
    }
}