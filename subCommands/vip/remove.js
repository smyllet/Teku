const func = require('../../addon/fonction')

module.exports = {
    name: 'remove',
    parent: 'vip',
    description: "Supprimé un vip",
    guildOnly: true,
    args: true,
    usage: '<@pseudo>',
    aliases: ['r','delete','del','rem'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        let member = message.mentions.members.first()
        if(!member) return message.channel.send("Merci d'entrer un nom d'utilisateur")

        let VIP = member.guild.roles.find(grade => grade.name == 'Vip')

        db.query(`SELECT u.id_user, u.permition_user FROM Users u WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                if(message) message.channel.send(`Erreur lors de l'identification de l'utilisateur`)
            }
            else
            {
                if((!func.havePermition(result[0].permition_user,2)) && (!member.roles.has(VIP.id)))
                {
                    message.channel.send("Ce membre n'est pas VIP")
                }
                else
                {
                    if(!func.havePermition(result[0].permition_user,2))
                    {
                        member.removeRole(VIP)
                        message.channel.send(member.displayName + " n'est plus VIP")
                    }
                    else
                    {
                        db.query(`UPDATE Users SET permition_user = ${result[0].permition_user/2} WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
                            if(err)
                            {
                                func.log('err',err)
                                if(message) message.channel.send(`Erreur lors de la modification des droits de l'utilisateur`)
                            }
                            else
                            {
                                if(member.roles.has(VIP.id)) member.removeRole(VIP)
                                message.channel.send(member.displayName + " n'est plus VIP")
                            }
                        })
                    }
                }
            }
        }) 
    }
}