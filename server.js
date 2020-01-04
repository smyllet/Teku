//----------Initialisation du programme----------//
//-------Addon-------//
const fs = require('fs') //système de gestion de fichier
const Discord = require('discord.js') //discord
var mysql = require('mysql')

const config = require('./config.json') //config

const func = require('./addon/fonction') //fonction
const func_db = require('./addon/func-database')
//---Variable---//
const bot = new Discord.Client();
bot.commands = new Discord.Collection()
bot.subCommands = new Discord.Collection()
bot.gradeList = new Discord.Collection()

//-------init serveur-------//
console.clear() //Effacer console

bot.on('ready', function () {
    bot.user.setActivity(config.botdesc)
    func.log('info','Le bot est connecté')
    autoRefreshUsersData()
    //console.log(bot.guilds.find('id',config.guildId).members)
})
bot.on('error', function (e) {
    func.log('err', e)
})

bot.login(config.token).catch(err => func.log('err',err))


//-------Connexion base de donnée-------//
var db

function handleDisconnect() {                    //Creation connexion avec la base de donnée
    db = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        charset: config.database.charset
    });
  
    db.connect(function(err) {                      //lors de la connexion
        if(err) {                                   // Si une erreur est détecter
            func.log('err',`Erreur de connexion avec la base de donnée : ${err}`) //envoyerl'erreur dans les logs
            setTimeout(handleDisconnect, 2000)      // delay avant de tenter une nouvelle connexion
        }
        else {                                      //Si il n'y pas d'erreur
            func.log('info','Connexion à la base de donnée réussi')  //Envoyer dans les logs que la connexion à réussi
        }
    })

    db.on('error', function(err) {                  //Lors d'erreur quand la connexion est déja établi
        func.log('err', `Erreur base de donnée : ${err}`) //Envoyer erreur dans les logs
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Si l'erreur correspond à une perte de connexion
            handleDisconnect()                      // Relancer la connexion
        } else {
            throw err
        }
    });
}

handleDisconnect() //Lancer la fonction de connexion base de donnée

//--------------------------------------------------------------------------------------------

//Auto refresh users data
function autoRefreshUsersData() {
    for (member of bot.guilds.find(key => key.id === config.guildId).members)
    {
        //console.log(member[1].user.tag)
        func_db.refreshUserData(null,db,member[1])
    }
    setTimeout(autoRefreshUsersData,900000)
}

//List commande
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)

	// Ajouter une nouvelle commande à la liste
	// avec la clé comme nom de commande et la valeur comme module exporté
	bot.commands.set(command.name, command)
}

const subCommandFiles = fs.readdirSync('./subCommands')

for (const dir of subCommandFiles) {
    const allSubCommands = fs.readdirSync(`./subCommands/${dir}`).filter(file => file.endsWith('.js'))

    for (const file of allSubCommands) {
        const subCommand = require(`./subCommands/${dir}/${file}`)

        bot.subCommands.set(`${subCommand.parent}#${subCommand.name}`,subCommand)
    }
}

//Grade list
bot.gradeList
    .set(1,'Utilisateur')
    .set(2,'VIP')
    .set(3,'Streamer')
    .set(5,'Animateur')
    .set(7,'Modérateur')
    .set(11,'Rédacteur')
    .set(13,'Administrateur')


//----------Partie principal----------//
//---Nouveau membre---//
bot.on("guildMemberAdd", async member =>
{
    func_db.refreshUserData(null,db,member)
    func.log('info',`${member.user.tag} a rejoin le serveur`)
})
bot.on("guildMemberRemove", async member =>
{
    func_db.refreshUserData(null,db,member,func.convertDate())
    func.log('info',`${member.user.tag} a quité le serveur`)
})

//---Pas de micro---//
bot.on("voiceStateUpdate", async (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel

    let VocalConnect = newMember.guild.roles.find(grade => grade.name == 'vocal-connect');

    if(oldUserChannel === undefined && newUserChannel !== undefined) {

        newMember.addRole(VocalConnect)
        func.log('vocal',`${newMember.user.tag} c'est connecté au salon ${newUserChannel.name}`)
   
    } else if(newUserChannel === undefined){
   
        newMember.removeRole(VocalConnect)
        func.log('vocal',`${newMember.user.tag} c'est déconnecté`)
   
    } else if((oldUserChannel !== undefined) && (newUserChannel !== undefined) && (oldUserChannel != newUserChannel)){

        func.log('vocal',`${newMember.user.tag} c'est déplacé du salon ${oldUserChannel.name} au salon ${newUserChannel.name}`)

    }
})

//---Scan message---//
bot.on("message", async message => 
{
    if (!message.content.startsWith(config.prefix) || message.author.bot) return //Si le message je commence pas par le prefix ou qu'il proviens du bot alors on eject

    const args = message.content.slice(config.prefix.length).split(/ +/)
    commandName = args.shift().toLowerCase() //Récupération commande et recalcule de arguments
    
    command = bot.commands.get(commandName)
        || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    
    if (!command) return

    if (!command.enable) return message.channel.send("Cette commande est désactivé")

    let cmdName = command.name

    if (command.subCommand) {
        let commandList = new Discord.Collection()
        for (let cmd of bot.subCommands){
            if(cmd[1].parent == command.name) commandList.set(cmd[1].name,cmd)
        }

        if (args.length) {
            let commandName = args[0] //Récupération commande

            let commandTemp = commandList.get(commandName)
            || commandList.find(cmd => cmd[1].aliases && cmd[1].aliases.includes(commandName))

            if(commandTemp)
            {
                command = commandTemp[1]
                args.shift().toLowerCase() //recalcule des arguments
                cmdName = cmdName + " " + command.name
                if (!command.enable) return message.channel.send("Cette commande est désactivé")
            }
            else return
        }     

        
    }

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('Je ne peux exécuter cette commande en message privé!')
    }

    //- - Vérification des droit d'utilisation du bot - -//
    db.query(`SELECT u.bot_permition FROM Users u WHERE u.id_discord_user = ${message.author.id}`, function(err,result, fields) {
        if(err)
        {
            func.log('err',err)
            return message.channel.send("Une erreur c'est produite lors de la vérification de vos permition, veuillez réessayer ou contacter un administrateur")
        }
        else
        {
            if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) return message.channel.send("Erreur lors de l'identification de l'utilisateur, veuillez réessayer ou contacter un administrateur")
            else if (result[0].bot_permition == 0) return message.channel.send("Vous n'êtes pas autorisé à interagir avec le bot")
            else if (result[0].bot_permition == 1)
            {
                //- - Verification des permition utilisateur - -//
                db.query(`SELECT u.permition_user FROM Users u WHERE u.id_discord_user = ${message.author.id}`, function(err,result, fields) {
                    if(err)
                    {
                        func.log('err',err)
                        return message.channel.send("Une erreur c'est produite lors de la vérification de vos permition, veuillez réessayer ou contacter un administrateur")
                    }
                    else
                    {
                        if ( ( result == ([] || null) ) || (result.length > 1) || result[0] == undefined) return message.channel.send("Erreur lors de l'identification de l'utilisateur, veuillez réessayer ou contacter un administrateur")
                        else if (!func.havePermition(result[0].permition_user,command.permition)) return message.channel.send("Vous n'êtes pas autorisé à utilisé cette commande")
                        else if (func.havePermition(result[0].permition_user,command.permition))
                        {
                            permition_user = result[0].permition_user
                            //- - Vérification des argument - -//
                            if (command.args && !args.length) {
                                let reply = `Argument manquant ou invalide, ${message.author}!`
                        
                                if (command.usage) {
                                    reply += `\nLa syntaxe correct est: \`${config.prefix}${cmdName} ${command.usage}\``
                                }

                                reply += `\nPour plus d'info faites \`${config.prefix}help ${cmdName}\``
                        
                                return message.channel.send(reply)
                            }

                            //- - Exécution de la commande
                            channelName = 'en ' + message.channel.type
                            if (message.channel.name) channelName = 'dans ' + message.channel.name
                            func.log('cmd',`${message.author.tag} ${channelName} - ${message.content}`)
                            try {
                                command.execute(message, args, db, result[0].permition_user)
                            } catch (error) {
                                func.log('err',error)
                                message.reply("Une erreur c'est produite lors de l'exécution de la commande!")
                            }
                        }
                    }
                })
            }
        }
    })
})