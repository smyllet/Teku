const func = require('../addon/fonction.js') //fonction
const yaml = require('yaml')
const fs = require('fs') //système de gestion de fichier

module.exports = {
    name: 'test',
    description: 'Command de test',
    guildOnly: true,
    args: false,
    usage: '',
    aliases: ['t','te'],
    permition: [13],
    enable: true,
    execute(message,args) {
        file = yaml.parse(fs.readFileSync('/data/dynivers-server/Teku/Development/whitelist.yml', 'utf8'))
        console.log(file)
        file.whitelist.push("hey")

        fs.writeFileSync('/data/dynivers-server/Teku/Development/whitelist.yml',yaml.stringify(file))
        
    }
}