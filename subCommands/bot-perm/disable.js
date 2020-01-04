const func = require('../../addon/fonction')

module.exports = {
    name: 'disable',
    parent: 'bot-perm',
    description: "Interdire à un utilisateur d'utiliser le bot",
    guildOnly: true,
    args: true,
    usage: '<@pseudo ou pseudo#0000>',
    aliases: ['d'],
    permition: [7],
    enable: true,
    execute(message,args,db) {
        const { gradeList } = message.client

        let member = message.mentions.members.first()
        if (member)
        {
            UserKey = 'id_discord_user'
            UserValue = member.id
        }
        else
        {
            UserKey = 'user_tag'
            UserValue = `'${args[0]}'`
        }


        db.query(`SELECT u.id_user, u.bot_permition FROM Users u WHERE ${UserKey} = ${UserValue}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                if(message) message.channel.send(`Erreur lors de l'identification de l'utilisateur`)
            }
            else
            {
                if( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined ) return message.channel.send('Utilisateur incorrect')
                if(((UserKey == 'user_tag') && (args[0] == message.author.tag)) || ((UserKey == 'id_discord_user') && (UserValue == message.author.id))) return message.channel.send('Action impossible sur sois même')

                if(!result[0].bot_permition == 1)
                {
                    message.channel.send("Ce membre ne possède pas la permition d'utiliser le bot")
                }
                else
                {
                    db.query(`UPDATE Users SET bot_permition = 0 WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
                        if(err)
                        {
                            func.log('err',err)
                            if(message) message.channel.send(`Erreur lors de la modification des droits de l'utilisateur`)
                        }
                        else
                        {
                            message.channel.send(member.displayName + " a perdu la permition d'utiliser le bot")
                        }
                    })
                }
            }
        })
    }
}