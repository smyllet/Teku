const func = require('../../addon/fonction')

module.exports = {
    name: 'reset',
    parent: 'cookie',
    description: "Réinitialisé un cookie à quelqu'un",
    guildOnly: true,
    args: false,
    usage: '[quantité restante après reset]',
    aliases: ['rs'],
    permition: [3,5,7,11,13],
    enable: true,
    execute(message,args,db) {
        if(args[0] && isNaN(args[0])) return message.channel.send("La quantité doit être un nombre entier")

        if(args[0]) cookies = parseInt(args[0]) 
        else cookies = 0

        db.query(`UPDATE Users SET cookies = ${cookies} WHERE id_discord_user = ${message.author.id}`, function(err,result, fields)
        {
            if(err)
            {
                func.log('err',err)
                if(message) message.channel.send(`Erreur lors de la supression des cookies'`)
            }
            else
            {
                message.channel.send(`Votre nombre de cookie à bien été réinitialisé\n:cookie: Cookie(s) : ${cookies}`)
            }
        })
    }
}