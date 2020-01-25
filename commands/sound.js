const func = require('../addon/fonction')

module.exports = {
    name: 'sound',
    description: "Gestion de la musique.",
    subCommand: true,
    guildOnly: true,
    args: true,
    permition: [2],
    enable: true,
    execute(message,args) {
        message.reply('Il y a eu une erreur')
    }
}