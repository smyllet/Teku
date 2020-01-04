const func = require('../addon/fonction')

module.exports = {
    name: 'template',
    description: "Template de commande",
    guildOnly: true,
    args: true,
    usage: '<argument obligatoire> [argument non obligatoire]',
    aliases: ['exemple','fake'],
    permition: [1],
    enable: false,
    execute(message,args,db,permitionUser) {
        //Contenue commande
    }
}