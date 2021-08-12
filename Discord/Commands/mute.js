config = require('../../config.json')

module.exports = {
    name: "mute",
    description: "Shuttttt",
    syntax: "mute [add|remove|list]",
    enable: true,
    argsRequire: false,
    role: "moderator",
    subCommands:
        {
            add:
            {
                name: "add",
                description: "Ajouter un membre à la liste des joueurs n'ayant plus la possibilité de s'exprimer",
                syntax: "mute add <@pseudo>",
                options: [
                    {
                        name: "membre",
                        type: "USER",
                        description: "Membre à ajouter à la liste des joueurs n'ayant plus la possibilité de s'exprimer",
                        required: true
                    }
                ],
                enable: true,
                argsRequire: true,
                role: "moderator",
                async execute(interaction) {
                    let member = interaction.options.getMember('membre')
                    /** @type {Role}*/
                    let role = interaction.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    if(!member) return interaction.reply({content: "Merci de mentionner le membre dont vous ne souhaitez plus lire les messages", ephemeral: true})
                    if(member.user.bot) return interaction.reply({content: "Bien essayé, mais c'est non !", ephemeral: true})
                    if(member === interaction.member) return interaction.reply({content: "Alors, même si ça ferait très plaisir à tout le monde, on va quand même éviter", ephemeral: true})
                    if(member.roles.cache.has(role.id)) return interaction.reply({content: "Désolé mais ce membre a déjà été réduit au silence", ephemeral: true})

                    member.roles.add(role)
                        .then(() => {
                            interaction.reply({content: `${member} a bien été réduit au silence`})
                        })
                        .catch(console.error)
                }
            },
            remove:
            {
                name: "remove",
                description: "Redonner la parole à un membre",
                syntax: "mute remove (@pseudo)",
                options: [
                    {
                        name: "membre",
                        type: "USER",
                        description: "Membre au quel rendre la parole",
                        required: true
                    }
                ],
                enable: true,
                argsRequire: true,
                role: "moderator",
                async execute(interaction) {
                    let member = interaction.options.getMember('membre')
                    /** @type {Role}*/
                    let role = interaction.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    if(!member) return interaction.reply({content: "Merci de mentionner le membre auquel vous voulez redonner la parole", ephemeral: true})
                    if(!member.roles.cache.has(role.id)) return interaction.reply({content: "Il semblerait que ce membre ait déjà la possibilité de s'exprimer", ephemeral: true})
                    if(member === interaction.member) return interaction.reply({content: "Comment ? Pas compris désolé", ephemeral: true})

                    member.roles.remove(role)
                        .then(() => {
                            interaction.reply({content: `${member} a bien retrouvé la parole`})
                        })
                        .catch(console.error)
                }
            },
            list:
            {
                name: "list",
                description: "Obtenir la liste des membres qui ont été mute",
                syntax: "mute list",
                enable: true,
                argsRequire: false,
                role: "moderator",
                async execute(interaction) {
                    let role = interaction.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    let list = []

                    interaction.guild.members.cache.map(member => {
                        if(member.roles.cache.has(role.id)) list.push(member.user.tag)
                    })

                    if(list.length === 0)
                    {
                        interaction.reply({content: `Aucun membre n'a été réduit au silence`})
                    }
                    else
                    {
                        interaction.reply({content: `Voici la liste des membres réduits au silence : \n - ${list.join('\n - ')}`})
                    }
                }
            }
        }
}