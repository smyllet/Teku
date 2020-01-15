const func = require('./fonction.js') //fonction
exports.refreshUserData = function (message,db,member,leave_date)
{
    if (!leave_date) leave_date = null
    else leave_date = `'${leave_date}'`

    if (leave_date != null) permOff = ', permition_user = 1'
    else permOff = ''

    db.query(`SELECT u.user_tag, u.user_nickname, u.user_leave FROM Users u WHERE id_discord_user = ${member.id}`, function(err,result, fields) {
        if(err)
        {
            func.log('err',err)
            if(message) message.channel.send(`Erreur lors de l'identification de l'utilisateur`)
        }
        else
        {
            if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) {
                db.query(`INSERT INTO Users(id_discord_user,bot_permition,permition_user,user_tag,user_first_tag,user_nickname,user_create,user_join) VALUES (${member.id},true,1,'${member.user.tag}','${member.user.tag}','${member.user.username}','${func.convertDate(member.user.createdAt)}','${func.convertDate(member.joinedAt)}')`, function(err,result, fields) {
                    if(err)
                    {
                        func.log('err',`Erreur lors de la création de l'utilisateur ${member.user.username} : ${err}`)
                        if(message) message.channel.send(`Erreur lors de la création de l'utilisateur ${member.user.username}`)
                    }
                    else
                    {
                        func.log('info',`${member.user.username} a été ajouté à la base de données`)
                        if(message) message.channel.send(`${member.user.username} a été ajouté à la base de données`)
                    }
                })
            }
            else if ((result[0].user_tag != member.user.tag) || (result[0].user_nickname != member.user.username) || (result[0].user_leave != leave_date))
            {
                db.query(`UPDATE Users SET user_tag = '${member.user.tag}', user_nickname = '${member.user.username}', user_leave=${leave_date}${permOff} where id_discord_user = ${member.id}`, function(err,result, fields) {
                    if(err)
                    {
                        func.log('err',`Erreur lors de la mise à jour de l'utilisateur ${member.user.username} : ${err}`)
                        if(message) message.channel.send(`Erreur lors de la mise à jour de l'utilisateur ${member.user.username}`)
                    }
                    else
                    {
                        func.log('info',`Les données de ${member.user.username} on été mise à jour`)
                        if(message) message.channel.send(`Les données de ${member.user.username} on été mise à jour`)
                    }
                })
            }
        }
    }) 
}