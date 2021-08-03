const staffNotifManager = require('../discordBotModule/staffNotifManager')
const logs = require('../../Global/module/logs')
const Discord = require('discord.js')

module.exports = {
    name: "bug",
    description: "Permet de signalé un bug",
    syntax: "bug (le bug que vous avez rencontré)",
    enable: true,
    argsRequire: true,
    role: "everyone",
    async execute(message, args) {
        let embed = new Discord.MessageEmbed()

        embed.setTitle(`Bug signalé par ${message.member.displayName}`)
        embed.setColor('#AC3227')
        embed.setFooter(message.author.tag, message.author.displayAvatarURL())
        embed.setTimestamp()
        embed.setDescription(args.join(' '))

        logs.warn(`Bug signalé par ${message.author.tag} : ${args.join(' ')}`)

        staffNotifManager.sendNotif({embeds: [embed]}).then(() => {
            message.channel.send('Votre bug a bien été signalé')
        })
    }
}