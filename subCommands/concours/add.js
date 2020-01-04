const func = require('../../addon/fonction')

module.exports = {
    name: 'add',
    parent: 'concours',
    description: "Commande d'ajout de concours",
    guildOnly: false,
    args: true,
    usage: '<nom concours>',
    aliases: ['a'],
    permition: [13],
    enable: true,
    execute(message,args) {
        message.reply('Ok ajouté concours')
    }
}