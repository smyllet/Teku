const func = require('../../addon/fonction')

module.exports = {
    name: 'remove',
    parent: 'bot-perm',
    description: "Suprimer une permition à un utilisateur",
    guildOnly: true,
    args: true,
    usage: '<Grade> <@pseudo>',
    aliases: ['r','supr'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        const { gradeList } = message.client

        gradeId = gradeList.findKey(grade => grade === args[0])
        if(gradeId == null) return message.channel.send("Ce grade n'existe pas")
        if(gradeId == 1) return message.channel.send("Impossible de revoker le droit d'utilisateur au bot")

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
                if(!func.havePermition(result[0].permition_user,gradeId))
                {
                    message.channel.send("Ce membre ne possède pas cette permition")
                }
                else
                {
                    db.query(`UPDATE Users SET permition_user = ${result[0].permition_user/gradeId} WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
                        if(err)
                        {
                            func.log('err',err)
                            if(message) message.channel.send(`Erreur lors de la modification des droits de l'utilisateur`)
                        }
                        else
                        {
                            message.channel.send(member.displayName + " a perdu la permition " + args[0])
                        }
                    })
                }
            }
        })
    }
}