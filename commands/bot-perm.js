const func = require('../addon/fonction')

module.exports = {
    name: 'bot-perm',
    description: "Commande de gestion des permition pour le bot",
    subCommand: true,
    guildOnly: true,
    args: true,
    usage: '<enable|disable|add|remove|list>',
    permition: [7,13],
    enable: true,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}