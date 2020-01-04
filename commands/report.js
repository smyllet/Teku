const func = require('../addon/fonction')
const config = require('../config.json') //config
const Discord = require('discord.js')

module.exports = {
    name: 'report',
    description: "Report un joueur, un bug . . .",
    subCommand: false,
    guildOnly: false,
    args: true,
    usage: '<message>',
    permition: [1],
    enable: true,
    execute(message,args) {
        const bot = message.client
        mes = args.join(' ')
        if (message.channel.type != 'dm') message.delete()

        const Embed = new Discord.RichEmbed()   //information pour la fiche
            .setColor("#770000")
            .setTitle("Report")
            .setDescription(mes)
            .setTimestamp()
            .setFooter('Report ' + message.author.tag);
            bot.guilds.find(key => key.id === config.guildId).channels.find( ch => ch.id == config.reportChannelId).send({ embed: Embed }) //envoie de la fiche

        message.author.createDM().then(channel => {
            channel.send("Ton report a bien été envoyé")
        })
    }
}