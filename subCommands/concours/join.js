const func = require('../../addon/fonction')

module.exports = {
    name: 'join',
    parent: 'concours',
    description: "Commande pour rejoindre un concours",
    guildOnly: false,
    args: false,
    usage: '<nom concours>',
    aliases: ['j'],
    permition: [13],
    enable: true,
    execute(message,args) {
        message.reply('Ok join concours')
    }
}