const func = require('../../addon/fonction')
const Discord = require('discord.js')

module.exports = {
    name: 'radio-list',
    parent: 'sound',
    description: "Listes des radio disponible sur le bot",
    guildOnly: true,
    args: false,
    usage: '',
    aliases: ['rlist'],
    permition: [1],
    enable: true,
    async execute(message,args,db) {
        const {radioList} = message.client
        needConnect = false

        ficheRadio = new Discord.RichEmbed()
            .setTitle('Liste des radios disponible sur le bot')
            .setColor('#FC7C04')
        
        for(radio of radioList)
        {
            rd = radioList.get(radio[0])
            if(rd.description) ficheRadio.addField(rd.title, rd.description)
            else ficheRadio.addField(rd.title, 'Pas de description')
        }

        message.channel.send({embed: ficheRadio})
    }
}