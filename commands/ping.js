const func = require('../addon/fonction')

module.exports = {
    name: 'ping',
    description: "Pong",
    guildOnly: false,
    args: false,
    usage: '',
    aliases: ['p'],
    permition: [1],
    enable: true,
    async execute(message) {
        msg = await message.channel.send(`🏓 Ping . . .`)

        msg.edit(`Pong! 🏓\nLatence : ${Math.floor(msg.createdAt - message.createdAt)}ms\nLatence API : ${Math.round(message.client.ping)}ms`)
    }
}