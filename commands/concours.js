const func = require('../addon/fonction')

module.exports = {
    name: 'concours',
    description: "Commande de gestion concours",
    subCommand: true,
    guildOnly: true,
    args: false,
    permition: [1],
    aliases: ['c'],
    enable: false,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}