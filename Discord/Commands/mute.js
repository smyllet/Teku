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
                enable: true,
                argsRequire: true,
                role: "moderator",
                async execute(message, args) {
                    let member = message.mentions.members.first()
                    let role = message.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    if(!member) return message.channel.send("Merci de mentionner le membre dont vous ne souhaitez plus lire les messages")
                    if(member.user.bot) return message.channel.send("Bien essayé, mais c'est non !")
                    if(member === message.member) return message.channel.send("Alors, même si ça ferais très plaisir à tout le monde, on va quand même éviter")
                    if(member.roles.cache.has(role.id)) return message.channel.send("Désolé mais ce membre a déjà été réduit au silence")

                    member.roles.add(role)
                        .then(r => {
                            message.channel.send(`${member} a bien été réduit au silence`)
                        })
                        .catch(console.error)
                }
            },
            remove:
            {
                name: "remove",
                description: "Redonner la parole à un membre",
                syntax: "mute remove (@pseudo)",
                enable: true,
                argsRequire: true,
                role: "moderator",
                async execute(message, args) {
                    let member = message.mentions.members.first()
                    let role = message.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    if(!member) return message.channel.send("Merci de mentionner le membre au quel vous voulez redonner la parole")
                    if(!member.roles.cache.has(role.id)) return message.channel.send("Il semblerais que ce membre ai déjà la possibilité de s'exprimer")
                    if(member === message.member) return message.channel.send("Comment ? Pas compris désolé")

                    member.roles.remove(role)
                        .then(r => {
                            message.channel.send(`${member} a bien retrouvé la parole`)
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
                async execute(message, args) {
                    let role = message.guild.roles.cache.find(key => key.id === config.bot.discord.roles.mute.id)

                    let list = []

                    message.guild.members.cache.map(member => {
                        if(member.roles.cache.has(role.id)) list.push(member.user.tag)
                    })

                    if(list.length === 0)
                    {
                        message.channel.send(`Aucun membre n'a été réduit au silence`)
                    }
                    else
                    {
                        message.channel.send(`Voici la liste des membres réduit au silence : \n - ${list.join('\n - ')}`)
                    }
                }
            }
        }
}