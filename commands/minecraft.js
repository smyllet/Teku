const func = require('../addon/fonction')

module.exports = {
    name: 'minecraft',
    description: "Commande de gestion du serveur Minecraft",
    subCommand: true,
    guildOnly: true,
    args: true,
    usage: '<subcommand>',
    aliases: ['mc'],
    permition: [1],
    enable: true,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}