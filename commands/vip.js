const func = require('../addon/fonction')

module.exports = {
    name: 'vip',
    description: "Commande de gestion des VIP",
    subCommand: true,
    guildOnly: true,
    args: true,
    usage: '<add|remove>',
    permition: [13],
    enable: true,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}