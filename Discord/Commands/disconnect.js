module.exports = {
    name: "disconnect",
    description: "Permet de se déconnecter du vocal",
    syntax: "disconnect",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(interaction) {
        if(interaction.member.voice.channel) {
            let voiceName = interaction.member.voice.channel.name
            interaction.member.voice.disconnect().then(() => {
                interaction.reply({content: `Vous avez bien été déconnecté du salon ${voiceName}`, ephemeral: true})
            }).catch(() => {
                interaction.reply({content: `Une erreur est survenue lors de votre déconnexion`, ephemeral: true})
            })
        } else interaction.reply({content: "Vous n'êtes pas connecté dans un salon vocal", ephemeral: true})
    }
}