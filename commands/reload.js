const func = require('../addon/fonction')

module.exports = {
    name: 'reload',
    description: "Commande de reload",
    guildOnly: false,
    args: true,
    usage: '<nom commande>',
    permition: [13],
    enable: true,
    execute(message,args) {
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
	        || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`Ils n'existe pas de commande : \`${commandName}\`, ${message.author}!`)

        delete require.cache[require.resolve(`./${commandName}.js`)]

        try {
            const newCommand = require(`./${commandName}.js`)
            message.client.commands.set(newCommand.name, newCommand)
            message.channel.send(`La commande ${commandName} à bien été rechargé`)
            func.log('warn',`${message.author.tag} à reload la commande ${commandName}`)
        } catch (error) {
            func.log('err',error)
            message.channel.send(`Erreur lors du reload de la commande : \`${commandName}\`:\n\`${error.message}\``)
        }
    }
}