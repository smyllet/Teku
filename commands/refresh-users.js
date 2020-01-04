const func = require('../addon/fonction')
const func_db = require('../addon/func-database')

module.exports = {
    name: 'refresh-users',
    description: "Commande de réactualisation des données utilisateur",
    guildOnly: true,
    args: false,
    usage: '[@userResfresh]',
    aliases: ['r','refresh'],
    permition: [13],
    enable: true,
    execute(message,args,db) {
        if(!args.length)
        {
            func.log('cmd-admin',`${message.author.tag} dans ${message.channel.name} - ${this.name}`)
            for (member of message.guild.members)
            {
                func_db.refreshUserData(message,db,member[1])
            }
        }
        else
        {
            let member = message.mentions.members.first();   //intégrer les infos members dans la variable member
            if (!member) return message.channel.send("Merci d'entrer un utilisateur !");   //si l'utilisateur n'a pas rentré de pseudo retourné le message "Merci d'entré un utilisateur !" et terminé la commande
            func.log('cmd-admin',`${message.author.tag} dans ${message.channel.name} - ${this.name} ${member.user.tag}`)
            func_db.refreshUserData(message,db,member)            
        }
    }
}