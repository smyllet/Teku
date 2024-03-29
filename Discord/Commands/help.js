const transfObject = require('../discordBotModule/transfObject')
const config = require('../../config.json')
const Discord = require('discord.js')

module.exports = {
    name: "help",
    description: "Liste des commandes",
    syntax: "help (commande)",
    options: [
        {
            name: "commande",
            type: "STRING",
            description: "Nom de la commande pour la quelle vous souhaitez optenir de l'aide"
        }
    ],
    enable: false,
    argsRequire: false,
    role: "everyone",
    async execute(message, args) {
        let commandManager = transfObject.getObject("commandManager")
        if(args.length === 0)
        {
            let embed = new Discord.MessageEmbed()
                .setColor('#0E7DC6')
                .setTitle(`   Liste des commandes   `)
                .setDescription('Vous pouvez faire `!help (nom commande)` pour obtenir des informations spécifiques sur une commande')

            let filtreList = {}
            filtreList.global = ""

            commandManager.getCommandsList().forEach(command => {
                if(command.hasPermission(message.member))
                {
                    if(command.subCommands)
                    {
                        filtreList[command.name] = ` - ${command.name}`
                        command.subCommands.getCommandsList().forEach(subCommand => {
                            if(subCommand.hasPermission(message.member)) filtreList[command.name] += `\n - ${subCommand.getFullName()}`
                        })
                    }
                    else
                    {
                        if(filtreList.global === "") filtreList.global = ` - ${command.name}`
                        else filtreList.global += `\n - ${command.name}`
                    }
                }
            })

            for (let [key, value] of Object.entries(filtreList))
            {
                embed.addField(key, value.toString())
            }

            message.channel.send({embeds: [embed]}).then()
        }
        else
        {
            let command = commandManager.getCommandAndArgsFromMessageText(config.bot.discord.commandPrefix + args.join(' '))?.command
            if(command) {
                if(command.hasPermission(message.member))
                {
                    let embed = new Discord.MessageEmbed()
                        .setColor('#0E7DC6')
                        .setTitle(`   Aide commande : ${command.getFullName()}   `)
                        .setDescription(command.description)
                        .addField('Syntaxe', command.getSyntax())

                    message.channel.send({embeds: [embed]}).then()
                }
                else message.channel.send("Vous n'avez pas la permission d'exécuter cette commande")
            } else message.channel.send("Commande inexistante")
        }
    }
}