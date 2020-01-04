const func = require('../addon/fonction')

module.exports = {
    name: 'sondage',
    description: "Commande de gestion des sondages",
    subCommand: true,
    guildOnly: true,
    args: true,
    permition: [1],
    enable: true,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}