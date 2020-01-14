const func = require('../addon/fonction.js') //fonction
var request = require('request')
const fs = require('fs')
const cheerio = require('cheerio')

module.exports = {
    name: 'test',
    description: 'Command de test',
    guildOnly: false,
    args: false,
    usage: '<oeuvre>',
    aliases: ['t','te'],
    permition: [13],
    enable: false,
    execute(message,args) {
        
    }
}