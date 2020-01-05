const func = require('../addon/fonction')

module.exports = {
    name: 'mute',
    description: "Mute un joueur dans tout les tchats du serveur",
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
        if (member.id === message.author.id) return message.channel.send("t'a pas autre chose a foutre que de t'auto mute?")
        if (member.roles.has(Mute.id)) return message.channel.send("ce membre est deja mute")
        member.addRole(Mute)
        message.channel.send(member.displayName + " a bien été mute")   
    }
}