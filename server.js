//----------Initialisation du programme----------//
//-------Addon-------//
const fs = require('fs') //système de gestion de fichier
const Discord = require('discord.js') //discord
var mysql = require('mysql')

const config = require('./config.json') //config

const func = require('./addon/fonction') //fonction
const func_db = require('./addon/func-database')

//---Variable---//
const bot = new Discord.Client()
bot.commands = new Discord.Collection()
bot.subCommands = new Discord.Collection()
bot.gradeList = new Discord.Collection()
bot.radioList = new Discord.Collection()
bot.radioActu = new Discord.Collection()

global.soundInfo = {}

//-------init serveur-------//
console.clear() //Effacer console

bot.on('ready', function () {
    bot.user.setActivity(config.botdesc)
    func.log('info','Le bot est connecté')
    autoRefreshUsersData()
    autoClearTchat()
})
bot.on('error', function (e) {
    func.log('err', e)
})

bot.on('debut', function (d) {
    func.log('warn', d)
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

//Auto Clear Message in salon
function autoClearTchat() {
    var date = new Date()
    if(((date.getHours() === 12) || (date.getHours() === 0)) && (date.getMinutes() === 0)){
        for(chan of config.clearChannel)
        {
            channel = bot.guilds.find(key => key.id === config.guildId).channels.find(key => key.id === chan)
            channel.bulkDelete(100,true)
                .catch(err => func.log('err',`autoClearTchat : ${err}`))
        }
    }
    setTimeout(autoClearTchat,60000)
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

//radio Actuelle
soundInfo.status = 'off'
soundInfo.volume = 0.08
soundInfo.connection = null
soundInfo.dispatcher = null
soundInfo.musicNow = null
soundInfo.radioBack = null
soundInfo.ytbSounds = []

//Liste radio
bot.radioList
    .set('NRJ',{title: 'NRJ', description: 'NRJ Hit Music Only !', url: 'http://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3?origine=fluxradios', logo:'https://www.stickpng.com/assets/images/584826e6cef1014c0b5e49da.png'})
    .set('RIRE & CHANSONS',{title: 'Rire & Chansons', description: 'La radio du rire', url: 'http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios', logo:'https://upload.wikimedia.org/wikipedia/fr/c/cd/Rire_%26_Chansons_logo_2012.png'})
    .set('FRANCE INFO',{title: 'France Info', description: 'Et tout est plus clair', url: 'http://direct.franceinfo.fr/live/franceinfo-midfi.mp3', logo:'https://upload.wikimedia.org/wikipedia/fr/thumb/1/18/France_Info_-_2008.svg/600px-France_Info_-_2008.svg.png'})
    .set('VOLTAGE',{title: 'Voltage', description: 'Les Hits d\'hier et d\'aujourd\'hui', url: 'http://start-voltage.ice.infomaniak.ch/start-voltage-high.mp3', logo: 'https://radioenlignefrance.com/assets/image/radio/180/voltage.jpg'})
    .set('SKYROCK',{title :'Skyrock', description: 'Premier sur le rap', url: 'http://icecast.skyrock.net/s/natio_aac_96k', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/57/Logo_Skyrock_2011.svg/1920px-Logo_Skyrock_2011.svg.png'})
    .set('CHERIE FM',{title: 'Chérie FM', description: 'La Plus Belle Musique', url: 'http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ch%C3%A9rie_FM_logo_2012.png'})
    .set('GENERATION',{title: 'Génération', description: 'Hip-hop soul radio', url: 'http://generationfm.ice.infomaniak.ch/generationfm-high.mp3', logo:'https://fr.wikipedia.org/wiki/G%C3%A9n%C3%A9rations_(radio)#/media/Fichier:G%C3%A9n%C3%A9rations.jpg'})
    .set('ED92',{title: 'ED92', description: 'Musique Disneyland', url: 'http://listen.shoutcast.com/ed92radio', logo:'https://www.ed92.org/wp-content/uploads/2019/12/Fichier-3.png'})

//----------Partie principal----------//
//---Nouveau membre---//
bot.on("guildMemberAdd", async member =>
{
    func_db.refreshUserData(null,db,member)
    func.log('info',`${member.user.tag} a rejoin le serveur`)
    member.addRole(member.guild.roles.find(grade => grade.name == 'Membre'))
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

        if(newMember.user.bot)
        {
            soundInfo.connection = null
            soundInfo.dispatcher = null
            soundInfo.status = 'off'
            soundInfo.musicNow = null
            soundInfo.volume = 0.08
            soundInfo.radioBack = null
            soundInfo.ytbSounds = []
        }
        else if(soundInfo.connection)
        {
            if(soundInfo.connection.channel.members.array().length <= 1)
            {
                setTimeout(function(){
                    if(soundInfo.connection && (soundInfo.connection.channel.members.array().length <= 1)) soundInfo.connection.disconnect()
                },10000)
            }
        }
   
    } else if((oldUserChannel !== undefined) && (newUserChannel !== undefined) && (oldUserChannel != newUserChannel)){

        func.log('vocal',`${newMember.user.tag} c'est déplacé du salon ${oldUserChannel.name} au salon ${newUserChannel.name}`)

        if(newMember.user.bot)
        {
            chan = soundInfo.connection.channel
            if((chan.members.array().length <= 1) || (chan.name.toLowerCase().includes('afk')))
            {
                setTimeout(function(){
                    if(soundInfo.connection && (soundInfo.connection.channel.members.array().length <= 1)) soundInfo.connection.disconnect()
                },10000)
            }
        }
        else if(soundInfo.connection)
        {
            chan = soundInfo.connection.channel
            if(chan.members.array().length <= 1)
            {
                setTimeout(function(){
                    if(soundInfo.connection && (soundInfo.connection.channel.members.array().length <= 1)) soundInfo.connection.disconnect()
                },10000)
            }
        }
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
        return message.reply('Je ne peux pas exécuter cette commande en message privé!')
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
                                func.log('err',"Erreur lors de l'exécution de la commande")
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