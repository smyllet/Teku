module.exports = {
    name: "afk",
    description: "Permet de se rendre dans le salon AFK",
    syntax: "afk",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(message) {
        if(!message.member.voice.channel) return message.channel.send("Vous n'êtes pas connecté dans un salon vocal")

        if(message.member.voice.channel === message.guild.afkChannel) return message.channel.send("Vous êtes déjà connecté dans le salon AFK")

        message.member.voice.setChannel(message.guild.afkChannel).then(() => {
            message.channel.send(`Vous avez bien été déplacé dans le salon AFK`)
        }).catch(() => {
            message.channel.send(`Une erreur est survenue lors de votre déplacement`)
        })
    }
}