const BlaguesAPI = require('blagues-api')
const Discord = require('discord.js')

config = require('../../config.json')

const blagues = new BlaguesAPI(config.blagueApi.token)

module.exports = {
    name: "joke",
    description: "Humour de djeuns",
    syntax: "joke",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(interaction) {
        await interaction.deferReply()

        blagues.randomCategorized(blagues.categories.GLOBAL).then(result => {
            let embed = new Discord.MessageEmbed()
            embed.setTitle("Humour de djeuns 🤣")
            embed.setDescription(`${result.joke}\n||${result.answer}||`)
            embed.setColor('#95DB20')
            embed.setThumbnail('https://raw.githubusercontent.com/Blagues-API/api/master/src/public/logo.png')
            embed.setFooter(`Blague n°${result.id} du site blagues-api.fr`)

            interaction.editReply({embeds: [embed]})
        }).catch(() => {
            interaction.editReply({content: "Une erreur est survenue"})
        })
    }
}
