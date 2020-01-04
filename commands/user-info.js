const func = require('../addon/fonction')
const Discord = require('discord.js')
const config = require('../config.json') //config

module.exports = {
    name: 'user-info',
    description: "Obtenir fiche d'information d'un membre",
    cat: 'Modération',
    guildOnly: true,
    args: true,
    usage: `<pseudo#0000 ou @pseudo>`,
    aliases: ['whois'],
    permition: [7,13],
    enable: true,
    execute(message,args,db,permitionUser) {
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

        db.query(`SELECT * FROM Users u WHERE ${UserKey} = ${UserValue}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                message.channel.send(`Erreur lors de la récupération des informations`)
            }
            else
            {
                if( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined ) return message.channel.send('Utilisateur incorrect')

                for (i = 0; i <result.length; i++)
                {
                    let UserData = {}
                    UserData.id_discord = result[i].id_discord_user
                    
                    if(result[i].bot_permition == 1) UserData.bot_permition = 'Autorisé'
                    else UserData.bot_permition = 'Interdit'  

                    idGradeUser = func.facteurPremier(result[i].permition_user)
                    UserData.permition_user = []
                    idGradeUser.shift()
                    for(grade of idGradeUser)
                    {
                        UserData.permition_user.push(` - ${gradeList.get(grade)}`)
                    }
                    UserData.permition_user.push(` - ${gradeList.get(1)}`)

                    UserData.tag = result[i].user_tag

                    UserData.first_tag = result[i].user_first_tag

                    UserData.nickname = result[i].user_nickname

                    UserData.create = func.convertDateRead(result[i].user_create)

                    UserData.join = func.convertDateRead(result[i].user_join)

                    if(result[i].user_leave) UserData.leave = func.convertDateRead(result[i].user_leave)

                    if(result[i].note) UserData.note = result[i].note


                    mb = message.guild.members.find(mb => mb.id == UserData.id_discord)
                    staffMode = false
                    if (message.channel.parent.id == config.staffZoneId) staffMode = true

                    //- - Création de la fiche - -//
                    //Paramètre
                    Fiche =  new Discord.RichEmbed()
                    Fiche.setTitle('Fiche utilisateur')

                    if (mb) Fiche.setColor(mb.displayColor)
                    else Fiche.setColor('#041721')

                    if (mb) Fiche.setThumbnail(mb.user.avatarURL)

                    //Partie Membre
                    dataMember = []
                    
                    dataMember.push(`**Pseudo :** ${UserData.nickname}`)                            //Pseudo
                    if (mb && (mb.colorRole != null)) dataMember.push(`**Rôle :** ${mb.colorRole}`)                           //Rôle
                    dataMember.push(`**Arrivé sur le serveur :** ${UserData.join}`)                 //Arrivé
                    if (UserData.leave) dataMember.push(`**Départ du serveur :** ${UserData.leave}`)//Quitté
                    

                    //Partie User
                    dataUser = []

                    dataUser.push(`**Tag :** ${UserData.tag}`)                                      //Tag
                    dataUser.push(`**Tag d'arrivée :** ${UserData.first_tag}`)                       //Tag d'arrivé
                    dataUser.push(`**Id :** ${UserData.id_discord}`)                                //Id
                    dataUser.push(`**Créé le:** ${UserData.create}`)                                //Crée


                    //Assemblage fiche
                    Fiche.addField('Membre',dataMember, true)
                    Fiche.addField('Utilisateur', dataUser, true)
                    Fiche.addBlankField()
                    Fiche.addField('Roles pour le bot', UserData.permition_user, true)
                    Fiche.addField(`Accès au bot`,UserData.bot_permition,true)
                    if (staffMode && UserData.note) Fiche.addField('Notes', note, false)

                    //Envoie fiche
                    message.channel.send({embed : Fiche})
                }
            }
        })
    }
}