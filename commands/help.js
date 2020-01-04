const { prefix } = require('../config.json')
const func = require('../addon/fonction')
const Discord = require('discord.js') //discord

module.exports = {
    name: 'help',
    description: "Commande d'aide",
    guildOnly: false,
    args: false,
    usage: '[nom commande]',
    aliases: ['h','cmds','commands'],
    permition: [1],
    enable: true,
    execute(message,args,db,permitionUser) {
        const { commands } = message.client
        const { subCommands } = message.client
        const { gradeList } = message.client

        channelName = 'en ' + message.channel.type
        if (message.channel.name) channelName = 'dans ' + message.channel.name
        func.log('cmd-user',`${message.author.tag} ${channelName} - ${this.name} ${args}`)

        if (!args.length) {
            MP = new Discord.RichEmbed()
            MP.setColor('#0E7DC6')
            MP.setTitle('   Liste de toutes les commandes   ')

            data = []
            for(var i = 0; i < commands.map(command => command.name).length;i++)
            {
                if((func.havePermition(permitionUser, commands.map(command => command.permition)[i])) && (commands.map(command => command.enable)[i]) && (!commands.map(command => command.subCommand)[i]) && (!commands.map(command => command.cat)[i])) data.push(` - ${commands.map(command => command.name)[i]}`)
            }
            if(data.length) MP.addField(`Global`,data)

            traitCat = []
            for(var i = 0; i < commands.map(command => command.name).length;i++)
            {
                if((func.havePermition(permitionUser, commands.map(command => command.permition)[i])) && (commands.map(command => command.enable)[i]) && (commands.map(command => command.subCommand)[i]))
                {
                    data = []
                    if ((commands.map(command => command.usage)[i]) && (!commands.map(command => command.args)[i])) data.push(` - ${commands.map(command => command.name)[i]}`)
                    for(var j = 0; j < subCommands.map(command => command.name).length;j++)
                    {
                        if((subCommands.map(command => command.parent)[j] == commands.map(command => command.name)[i]) && func.havePermition(permitionUser, subCommands.map(command => command.permition)[j]) && subCommands.map(command => command.enable)[j])
                        {
                            data.push(` - ${commands.map(command => command.name)[i]} ${subCommands.map(command => command.name)[j]}`)
                        }
                    }
                    if(data.length) MP.addField(`${commands.map(command => command.name)[i]}`,data)
                }


                if((func.havePermition(permitionUser, commands.map(command => command.permition)[i])) && (commands.map(command => command.enable)[i]) && (!commands.map(command => command.subCommand)[i]) && (commands.map(command => command.cat)[i]) && (!traitCat.includes(commands.map(command => command.cat)[i])))
                {
                    data = []
                    traitCat.push(commands.map(command => command.cat)[i])
                    for(var k = 0; k < commands.map(command => command.name).length;k++)
                    {
                        if((commands.map(command => command.cat)[k] == commands.map(command => command.cat)[i]) && func.havePermition(permitionUser, commands.map(command => command.permition)[k]) && commands.map(command => command.enable)[k])
                        {
                            data.push(` - ${commands.map(command => command.name)[k]}`)
                        }
                    }
                    if(data.length) MP.addField(`${commands.map(command => command.cat)[i]}`,data)
                }
            }

            MP.setDescription(`\nVous pouvez faire \`${prefix}help [nom commande]\` pour obtenir des informations spécifiques sur une commande`)
            
            return message.author.send({ embed: MP })
                .then(() => {
                    if (message.channel.type === 'dm') return
                    message.reply('Je vous ai envoyé un DM avec toutes mes commandes!')
                })
                .catch(error => {
                    let erreur = `Impossible d'envoyer un MP à ${message.author.tag}.\n` + error;
                    func.log('err', erreur)
                    message.reply('On dirait que je ne peux pas vous envoyer de message privé! Avez-vous des message privé désactivés?')
                })
        }
        else {
            MP = new Discord.RichEmbed()
            MP.setColor('#0E7DC6')
            data = []
            name = args[0].toLowerCase();
            command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

            if (!command) {
	            return message.reply("Cette commande n'existe pas")
            }

            if (!command.enable) {
                return message.reply("Cette commande est désactivé")
            }

            name = command.name
            
            if(command.subCommand){
                if (args[1]){
                    let commandList = new Discord.Collection()
                    for (let cmdl of subCommands)
                    {
                        if(cmdl[1].parent == command.name) commandList.set(cmdl[1].name,cmdl)
                    }
                    let commandName = args[1] //Récupération commande

                    let commandTemp = commandList.get(commandName)
                    || commandList.find(cmd => cmd[1].aliases && cmd[1].aliases.includes(commandName))
                        
                    if(commandTemp)
                    {
                        command = commandTemp[1]
                        name = `${name} ${command.name}`
                    }
                    else return message.reply("Cette commande n'existe pas !")
                }
            }

            MP.setTitle(`   Aide commande : ${name}   `)

            if (!func.havePermition(permitionUser,command.permition)) {
                return message.reply("Vous n'êtes pas autorisé à utilisé cette commande")
            }
            if (!command.enable) {
                return message.reply("Cette commande est désactivé")
            }

            if (command.description) MP.setDescription(command.description)
            if (command.aliases) MP.addField('Aliases',command.aliases.join(', '))
            if (command.usage) MP.addField('Syntaxe', `${prefix}${name} ${command.usage}`)

            data = []
            for (perm of command.permition)
            {
                data.push(` - ${gradeList.get(perm)}`)
            }
            if (data != []) MP.addField('Role requis',data)

            if(command.guildOnly) data = 'Interdit'
            else data = 'Autorisé'
            MP.addField('Message privé', data)

            if(command.subCommand) {
                data = []
                for(var j = 0; j < subCommands.map(command => command.name).length;j++)
                {
                    if((subCommands.map(command => command.parent)[j] == command.name) && func.havePermition(permitionUser, subCommands.map(command => command.permition)[j]) && subCommands.map(command => command.enable)[j])
                    {
                        data.push(` - ${command.name} ${subCommands.map(command => command.name)[j]}`)
                    }
                }
                MP.addField('Sous commande', data)
            }

            message.channel.send({embed : MP})
        }
    }
}