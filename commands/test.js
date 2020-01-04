const func = require('../addon/fonction.js') //fonction

module.exports = {
    name: 'test',
    description: 'Command de test',
    guildOnly: false,
    args: true,
    usage: '<user> <role>',
    aliases: ['t','te'],
    permition: [13],
    enable: false,
    execute(message,args) {
        /*message.channel.send(`La décomposition en facteur premier de ${args} est : ${func.facteurPremier(args)}`)
        if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

        message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`)*/
        
        const { subCommands } = message.client;
        const { commands } = message.client;

        console.log(subCommands)
        //console.log(commands)
        

        //message.channel.send(memberList)
    }
}