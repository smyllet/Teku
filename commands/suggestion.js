const func = require('../addon/fonction')
const config = require('../config.json') //config
const Discord = require('discord.js')

module.exports = {
    name: 'suggestion',
    description: "Envoyer des suggestion au staff",
    subCommand: false,
    guildOnly: false,
    args: true,
    usage: '<message>',
    aliases: ['suggest'],
    permition: [1],
    enable: true,
    execute(message,args) {
        const bot = message.client
        mes = args.join(' ')

        const Embed = new Discord.RichEmbed()   //information pour la fiche
            .setColor("#112233")
            .setTitle("Suggestion")
            .setDescription(mes)
            .setTimestamp()
            .setFooter('Suggestion de ' + message.author.tag);
            bot.guilds.find(key => key.id === config.guildId).channels.find( ch => ch.id == config.reportChannelId).send({ embed: Embed }) //envoie de la fiche

        message.channel.send('Ta suggestion a bien été envoyé')
    }
}