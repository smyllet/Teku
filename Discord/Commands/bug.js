const staffNotifManager = require('../discordBotModule/staffNotifManager')
const logs = require('../../Global/module/logs')
const Discord = require('discord.js')

module.exports = {
    name: "bug",
    description: "Permet de signalé un bug",
    syntax: "bug (le bug que vous avez rencontré)",
    options: [
        {
            name: "message",
            type: "STRING",
            description: "Descriptif du bug que vous avez rencontré",
            required: true
        }
    ],
    enable: true,
    argsRequire: true,
    role: "everyone",
    async execute(interaction) {
        let message = interaction.options.getString('message')

        let embed = new Discord.MessageEmbed()

        embed.setTitle(`Bug signalé par ${interaction.member.displayName}`)
        embed.setColor('#AC3227')
        embed.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        embed.setTimestamp()
        embed.setDescription(message)

        logs.warn(`Bug signalé par ${interaction.user.tag} : ${message}`)

        staffNotifManager.sendNotif({embeds: [embed]}).then(() => {
            interaction.reply({content: 'Votre bug a bien été signalé', ephemeral: true})
        })
    }
}