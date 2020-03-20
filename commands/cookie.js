const func = require('../addon/fonction')

module.exports = {
    name: 'cookie',
    description: "Cookie ! ! Cherchez pas à comprendre ces commandes n'ont aucun sense",
    subCommand: true,
    guildOnly: false,
    args: false,
    permition: [3,5,7,11,13],
    enable: true,
    execute(message,args,db) {
        db.query(`SELECT u.cookies FROM Users u WHERE u.id_discord_user = ${message.author.id}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                return message.channel.send("Une erreur c'est produite lors de l'optention de vos information")
            }
            else
            {
                if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) return message.channel.send("Erreur lors de l'identification de l'utilisateur, veuillez réessayer ou contacter un administrateur")
                else
                {
                    message.channel.send(`:cookie: Cookie(s) : ${result[0].cookies}`)
                }
            }
        })
    }
}