const func = require('../../addon/fonction')

module.exports = {
    name: 'info',
    parent: 'cookie',
    description: "Voir le nombre de cookie de quelqu'un",
    guildOnly: true,
    args: true,
    usage: '<@pseudo>',
    aliases: ['g'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        let member = message.mentions.members.first()
        if(!member) return message.channel.send("Merci d'entrer un nom d'utilisateur")

        db.query(`SELECT u.cookies FROM Users u WHERE u.id_discord_user = ${member.id}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                return message.channel.send("Une erreur c'est produite lors de l'optention des information information")
            }
            else
            {
                if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) return message.channel.send("Erreur lors de l'identification de l'utilisateur, veuillez réessayer ou contacter un administrateur")
                else
                {
                    message.channel.send(`:cookie: Cookie(s) de ${member.displayName} : ${result[0].cookies}`)
                }
            }
        })
    }
}