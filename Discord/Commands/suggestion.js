const staffNotifManager = require('../discordBotModule/staffNotifManager')
const Discord = require('discord.js')

module.exports = {
    name: "suggestion",
    description: "Une suggestion ? c'est ici !",
    syntax: "suggestion (votre recommandation)",
    enable: true,
    argsRequire: true,
    role: "everyone",
    async execute(message, args) {
        let embed = new Discord.MessageEmbed()

        embed.setTitle(`Suggestion de ${message.member.displayName}`)
        embed.setColor('#FCFC9C')
        embed.setFooter(message.author.tag, message.author.displayAvatarURL())
        embed.setTimestamp()
        embed.setDescription(args.join(' '))

        staffNotifManager.sendNotif(embed).then(m => {
            m.react('❤')
            m.react('💀')
            message.channel.send('Votre suggestion a bien été envoyé')
        })
    }
}