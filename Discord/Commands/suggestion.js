const staffNotifManager = require('../discordBotModule/staffNotifManager')
const Discord = require('discord.js')

module.exports = {
    name: "suggestion",
    description: "Une suggestion ? c'est ici !",
    syntax: "suggestion (votre recommandation)",
    options: [
        {
            name: "message",
            type: "STRING",
            description: "Votre suggestion",
            required: true
        }
    ],
    enable: true,
    argsRequire: true,
    role: "everyone",
    async execute(interaction) {
        let message = interaction.options.getString('message')

        let embed = new Discord.MessageEmbed()

        embed.setTitle(`Suggestion de ${interaction.member.displayName}`)
        embed.setColor('#FCFC9C')
        embed.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        embed.setTimestamp()
        embed.setDescription(message)

        staffNotifManager.sendNotif({embeds: [embed]}).then(m => {
            m.react('❤')
            m.react('💀')
            interaction.reply({content: 'Votre suggestion a bien été envoyé', ephemeral: true})
        })
    }
}