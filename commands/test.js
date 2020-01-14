const func = require('../addon/fonction.js') //fonction

module.exports = {
    name: 'test',
    description: 'Command de test',
    guildOnly: true,
    args: false,
    usage: '',
    aliases: ['t','te'],
    permition: [13],
    enable: false,
    execute(message,args) {
        
    }
}