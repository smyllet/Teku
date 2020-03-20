const func = require('../../addon/fonction')

module.exports = {
    name: 'give',
    parent: 'cookie',
    description: "Donnez un cookie à quelqu'un",
    guildOnly: true,
    args: true,
    usage: '<quantité> <@pseudo>',
    aliases: ['g'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        if(isNaN(args[0]) || args[0] < 1) return message.channel.send("La quantité doit être un nombre supérieur à 0")

        let member = message.mentions.members.first()
        if(!member) return message.channel.send("Merci d'entrer un nom d'utilisateur")

        db.query(`SELECT u.id_user, u.cookies FROM Users u WHERE id_discord_user = ${member.id}`, function(err,result, fields)
        {
            if(err)
            {
                func.log('err',err)
                return message.channel.send("Une erreur c'est produite lors de l'optention de vos information")
            }
            else
            {
                cookies = result[0].cookies + parseInt(args[0])
                db.query(`UPDATE Users SET cookies = ${cookies} WHERE id_discord_user = ${member.id}`, function(err,result, fields)
                {
                    if(err)
                    {
                        func.log('err',err)
                        if(message) message.channel.send(`Erreur lors de l'ajout des cookies'`)
                    }
                    else
                    {
                        message.channel.send(member.displayName + " a maintenant " + cookies + " cookies")
                        member.createDM().then(channel => {
                            coo = parseInt(args[0])
                            if(coo == 1) part1 = `${coo} cookie a`
                            else part1 = `${coo} cookies ont`

                            if(cookies == 1) part2 = `${cookies} cookie (prend ton temps pour le réclamer :wink:)`
                            else if(cookies == 0) part2 = `${cookies} cookie (je connais quelqu'un qui pour qui cela n'arrive jamais :innocent:)`
                            else if (cookies < 0) part2 = `${cookies} cookie (c'est pas beaucoup :smiling_imp:)`
                            else part2 = `${cookies} cookies (prend ton temps pour les réclamer :wink:)`
                            channel.send(`${part1} été ajouté à ton solde, tu dispose maintenant de ${part2}`)
                        })
                    }
                })
            }
        })
    }
}