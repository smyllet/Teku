module.exports = {
    name: "ping",
    description: "Pong",
    syntax: "ping",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(message) {
        let msg = await message.channel.send(`🏓 Ping . . .`)
        
        await msg.edit(`Pong! 🏓\nLatence : ${Math.floor(msg.createdAt - message.createdAt)}ms\nLatence API : ${Math.round(message.client.ws.ping)}ms`)
    }
}