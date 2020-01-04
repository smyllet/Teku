const func = require('../../addon/fonction')

module.exports = {
    name: 'create',
    parent: 'sondage',
    description: "Créer un sondage",
    guildOnly: true,
    args: true,
    usage: '<clé_sondage (10 car. max et sans espace)>',
    aliases: ['c'],
    permition: [3,5,7,11,13],
    enable: true,
    execute(message,args,db) {
        //TODO
    }
}