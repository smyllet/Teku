module.exports = {
    name: "ping",
    description: "Pong",
    syntax: "ping",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(interaction) {
        await interaction.reply({content: `🏓 Ping . . .`})

        /** @type {any} */
        let msg = await interaction.fetchReply()
        
        await interaction.editReply(`Pong! 🏓\nLatence : ${Math.floor(msg.createdAt - interaction.createdAt)}ms\nLatence API : ${Math.round(interaction.client.ws.ping)}ms`)
    }
}