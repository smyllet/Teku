const func = require('../../addon/fonction')

module.exports = {
    name: 'add',
    parent: 'bot-perm',
    description: "Ajouter une permission à un utilisateur",
    guildOnly: true,
    args: true,
    usage: '<Grade> <@pseudo>',
    aliases: ['a'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        const { gradeList } = message.client

        gradeId = gradeList.findKey(grade => grade === args[0])
        if(gradeId == null) return message.channel.send("Ce grade n'existe pas")

        let member = message.mentions.members.first()
        if(!member) return message.channel.send("Merci d'entrer un nom d'utilisateur")


        db.query(`SELECT u.id_user, u.permition_user FROM Users u WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                if(message) message.channel.send(`Erreur lors de l'identification de l'utilisateur`)
            }
            else
            {
                if(func.havePermition(result[0].permition_user,gradeId))
                {
                    message.channel.send("Ce membre possède déja cette permission")
                }
                else
                {
                    db.query(`UPDATE Users SET permition_user = ${result[0].permition_user*gradeId} WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
                        if(err)
                        {
                            func.log('err',err)
                            if(message) message.channel.send(`Erreur lors de la modification des droits de l'utilisateur`)
                        }
                        else
                        {
                            message.channel.send(member.displayName + " a obtenu la permission " + args[0])
                        }
                    })
                }
            }
        })
    }
}