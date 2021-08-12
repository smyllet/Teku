const fs = require('fs')
const Discord = require('discord.js')
const Command = require('./Command')
const config = require('../../config.json')

class CommandManager
{
    /** @type {Object<string, Command>} */
    commands = {}

    /** @return {void} */
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
                                command.name,
                                subCommand.description,
                                subCommand.syntax,
                                subCommand.options,
                                subCommand.enable,
                                subCommand.argsRequire,
                                subCommand.role,
                                subCommand.execute,
                                null
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
                        null,
                        command.description,
                        command.syntax,
                        command.options,
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

    /** @param {Command} command */
    // Ajouter une commande
    addCommand(command)
    {
        this.commands[command.name] = command
    }

    /** @param {String} name
     *  @return {Command} command*/
    // Obtenir un commande par son nom
    getCommandByName(name)
    {
        if(this.commands[name]) return this.commands[name]
        else return null
    }

    /** @param {string} message
     *  @return {Object<Command, array<string>>} Command and arguments */
    // Obtenir une commande et des arguments à partir d'un message Discord
    getCommandAndArgsFromMessageText(message)
    {
        let args = message.slice(config.bot.discord.commandPrefix.length).split(/ +/)
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

    /** @param {Discord.CommandInteraction} interaction
     *  @return {Command} Command */
    // Obtenir une commande et des arguments à partir d'un message Discord
    getCommandFromInteraction(interaction)
    {
        let command = this.getCommandByName(interaction.commandName)

        if(command)
        {
            let subCommandName = interaction.options.getSubcommand(false)
            if(command.subCommands && subCommandName)
            {
                let subCommand = command.subCommands.getCommandByName(subCommandName)
                if(subCommand) return subCommand
                else return null
            }
            else return command
        }
        else return null
    }

    /** @return {array<Command>} commandsList */
    getCommandsList()
    {
        let commandsList = []
        for (let [key, command] of Object.entries(this.commands))
        {
            commandsList.push(command)
        }
        return commandsList
    }

    /** @return {any} slashData */
    getSlashData()
    {
        let datas = []
        for(let [key, command] of Object.entries(this.commands))
        {
            datas.push(command.getSlashData())
        }
        return datas
    }

    /** @return {any} slashData */
    getSubSlashData()
    {
        let datas = []
        for(let [key, command] of Object.entries(this.commands))
        {
            datas.push(command.getSubSlashData())
        }
        return datas
    }
}

module.exports = CommandManager