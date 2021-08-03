module.exports = {
    name: "afk",
    description: "Permet de se rendre dans le salon AFK",
    syntax: "afk",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(interaction) {
        if(!interaction.member.voice.channel) return interaction.reply({content: "Vous n'êtes pas connecté dans un salon vocal", ephemeral: true})

        if(interaction.member.voice.channel === interaction.guild.afkChannel) return interaction.reply({content: "Vous êtes déjà connecté dans le salon AFK", ephemeral: true})

        interaction.member.voice.setChannel(interaction.guild.afkChannel).then(() => {
            interaction.reply({content: `Vous avez bien été déplacé dans le salon AFK`, ephemeral: true})
        }).catch(() => {
            interaction.reply({content: `Une erreur est survenue lors de votre déplacement`, ephemeral: true})
        })
    }
}