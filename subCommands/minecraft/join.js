const func = require('../../addon/fonction')
const yaml = require('yaml')
const fs = require('fs') //système de gestion de fichier
const config = require('../../config.json')

module.exports = {
    name: 'join',
    parent: 'minecraft',
    description: "Rejoindre le serveur Minecraft de Dynivers",
    guildOnly: true,
    args: true,
    usage: '<pseudo minecraft>',
    permition: [1],
    enable: true,
    async execute(message,args,db) {
        if(config.minecraft.active == false) return message.channel.send("Le module de serveur Minecraft est actuellement désactivé")
        pseudo = args[0].toLowerCase()
        db.query(`SELECT u.mc_pseudo, u.mc_lock FROM Users u WHERE u.id_discord_user = ${message.author.id}`, function(err,result, fields) {
            if(err)
            {
                func.log('err',err)
                return message.channel.send("Une erreur c'est produite lors de la vérification de vos information, veuillez réessayer ou contacter un administrateur")
            }
            else
            {
                if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) return message.channel.send("Erreur lors de l'identification de l'utilisateur, veuillez réessayer ou contacter un administrateur")
                else if(result[0].mc_lock == 1) return message.channel.send("Vous n'êtes pas autorisé à rejoindre le serveur")
                else if(result[0].mc_pseudo != null) return message.channel.send("Vous êtes déja enregistré sur le serveur, si vous n'arrivez pas à vous connectez ou avez changer de pseudo veuillez contacter un administrateur")
                else
                {
                    db.query(`UPDATE Users SET mc_pseudo = '${pseudo}' WHERE id_discord_user = ${message.author.id}`, function(err,result, fields) {
                        if(err)
                        {
                            func.log('err',err)
                            message.channel.send(`Erreur lors de l'ajout à la whitelist`)
                        }
                        else
                        {
                            try
                            {
                                file = yaml.parse(fs.readFileSync(config.minecraft.whitelistFile, 'utf8'))
                                file.globalWhitelist.whitelist.push(pseudo)
                                fs.writeFileSync(config.minecraft.whitelistFile,yaml.stringify(file))
                                message.channel.send(`Le joueur ${pseudo} à bien été ajouté à la whitelist`)

                                desc = fs.readFileSync( `${__dirname}/../../minecraftDesc.txt`,'utf8')
                                message.author.send(desc)
                                    .then(() => {
                                        if (message.channel.type === 'dm') return
                                        message.reply('Des informations supplémentaires ont été envoyées par message privé!')
                                    })
                                    .catch(error => {
                                        let erreur = `Impossible d'envoyer un MP à ${message.author.tag}.\n` + error;
                                        func.log('err', erreur)
                                        message.reply('On dirait que je ne peux pas vous envoyer de message privé! Avez-vous des message privé désactivés?')
                                    })
                                
                                let MinecraftR = message.member.guild.roles.find(grade => grade.name == 'Minecraft')
                                if(!message.member.roles.has(MinecraftR.id)) message.member.addRole(MinecraftR)
                            }
                            catch(e)
                            {
                                message.channel.send("Erreur lors de l'ajout à la whitelist")
                            }
                        }
                    })
                }
            }
        })
    }
}