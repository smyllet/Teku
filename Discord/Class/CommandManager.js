const fs = require('fs')
const Command = require('./Command')
const config = require('../../config.json')

class CommandManager
{
    commands = {}

    // Ajouter automatiquement les commandes du dossier commands
    autoAddAllCommand()
    {
        // Pour tout les fichiers ce trouvant dans le dossier Commands
        fs.readdirSync('./Discord/Commands').filter(file => file.endsWith('.js')).forEach(file => {
            let command = require(`../Commands/${file}`)

            let subCommands = new CommandManager()

            // Si la commande possède des sous commandes
            if(command.subCommands)
            {
                // Ajout des sous commandes
                for (let [key, subCommand] of Object.entries(command.subCommands))
                {
                    if(subCommand.enable)
                    {
                        subCommands.addCommand(
                            new Command(subCommand.name,
                                subCommand.description,
                                subCommand.syntax,
                                subCommand.enable,
                                subCommand.argsRequire,
                                subCommand.role,
                                subCommand.execute,
                            )
                        )
                    }
                }
            }
            else subCommands = null

            // Ajout des commandes
            if(command.enable)
            {
                this.addCommand(
                    new Command(command.name,
                        command.description,
                        command.syntax,
                        command.enable,
                        command.argsRequire,
                        command.role,
                        command.execute,
                        subCommands
                    )
                )
            }
        })
    }

    // Ajouter une commande
    addCommand(command)
    {
        this.commands[command.name] = command
    }

    // Obtenir un commande par son nom
    getCommandByName(name)
    {
        if(this.commands[name]) return this.commands[name]
        else return null
    }

    // Obtenir une commande et des arguments à partir d'un message Discord
    getCommandAndArgsFromMessage(message)
    {
        let args = message.content.slice(config.bot.discord.commandPrefix.length).split(/ +/)
        let name = args.shift().toLowerCase()
        let command = this.commands[name]

        if(command)
        {
            if(command.subCommands && (args.length > 0))
            {
                name = args.shift().toLowerCase()
                let subCommand = command.subCommands.getCommandByName(name)
                if(subCommand) return {command: subCommand, args: args}
                else return null
            }
            else return {command : command, args : args}
        }
        else return null
    }

}

module.exports = CommandManager