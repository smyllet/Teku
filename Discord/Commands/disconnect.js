module.exports = {
    name: "disconnect",
    description: "Permet de se déconnecter du vocal",
    syntax: "disconnect",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(message) {
        if(message.member.voice.channel) {
            let voiceName = message.member.voice.channel.name
            message.member.voice.disconnect().then(() => {
                message.channel.send(`Vous avez bien été déconnecté du salon ${voiceName}`)
            }).catch(() => {
                message.channel.send(`Une erreur est survenue lors de votre déconnexion`)
            })
        } else message.channel.send("Vous n'êtes pas connecté dans un salon vocal")
    }
}