// Import config
config = require('../../config.json')

// Import module
const Discord = require('discord.js')
const sc = require('@nyakimov/senscritique-api')
const eventManager = require('../discordBotModule/EventManager')

// Emote
let choix = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
let scColor = "#0CD46C"
let scLogo = "https://static.senscritique.com/img/about/logo-sc.png"

function getResultEmbed(result, searchInput, activeChoix) {
    let embed = new Discord.MessageEmbed()
        .setTitle(`SensCritique - Résultat de recherche`)
        .setDescription(`Recherche : ${searchInput}`)
        .setColor(scColor)
        .setThumbnail(scLogo)

    result.forEach((r, index) => {
        let detail = []
        detail.push(`Type : ${(r.type) ? r.type : 'Inconnu'}`)
        detail.push(`Genre(s) : ${(r.genres && (r.genres.length > 0)) ? r.genres.join(', ') : 'Inconnu'}`)
        detail.push(`Créateur(s) : ${(r.creators && (r.creators.length > 0)) ? r.creators.join(', ') : 'Inconnu'}`)
        detail.push(`Note : ${(r.rating) ? r.rating : 'Inconnu'}`)

        embed.addField(`${(activeChoix) ? `${choix[index]} ` : ''}${r.title}${(r.year) ? ` (${r.year})` : ""}`, detail.join('\n'))
    })

    return embed
}

function numFormatter(num) {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
    }else if(num > 1000000){
        return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million
    }else if(num < 900){
        return num; // if value < 1000, nothing to do
    }
}

function dateToString(date) {
    let mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    let dateSplit = date.split('/')
    if(dateSplit.length) {
        return `${Number(dateSplit[0])} ${mois[Number(dateSplit[1])-1]} ${dateSplit[2]}`
    } else return date
}

module.exports = {
    name: "senscritique",
    description: "Recherche une oeuvre sur senscritique",
    syntax: "senscritique",
    enable: true,
    argsRequire: true,
    role: "everyone",
    async execute(message, args) {
        let searchInput = args.join(' ')

        let embed = new Discord.MessageEmbed()
            .setTitle(`SensCritique - Recherche en cours`)
            .setDescription(`Recherche : ${searchInput}`)
            .setColor(scColor)
            .setThumbnail(scLogo)

        /** @type Message */
        let mes = await message.channel.send({embed: embed})

        sc.search(searchInput).then(async res => {
            let result = res.items.slice(0, 5)

            let embed = getResultEmbed(result, searchInput, true)

            await mes.edit({embed: embed})

            for(let i = 0; i < result.length; i++) {
                mes.react(choix[i]).then()
            }

            mes.react('❌').then()

            let timeout = setTimeout(() => {
                eventManager.removeAllListeners(`messageReactionAdd_${mes.id}`)
                mes.reactions.removeAll()
                let embed = getResultEmbed(result, searchInput)
                mes.edit({embed:embed})
            }, 30000)

            eventManager.once(`messageReactionAdd_${mes.id}`, messageReaction => {
                mes.reactions.removeAll()
                clearTimeout(timeout)

                let c = choix.indexOf(messageReaction.emoji.name)
                if((c !== -1) && (result.length > c)) {
                    sc.get(result[c].url).then(data => {
                        let embed = new Discord.MessageEmbed()
                            .setTitle(data.title)
                            .setURL(data.url)
                            .setDescription(data.resume)
                            .setColor(scColor)
                            .setThumbnail(scLogo)
                            .setFooter(`${data.title} - SensCritique`)
                            .setTimestamp()

                        embed.addField('Type', (data.type) ? data.type : "Inconnu")
                        embed.addField('Date de sortie', (data.date) ? dateToString(data.date) : "Inconnue")
                        embed.addField('Genre(s)', (data.genres && data.genres.length > 0) ? data.genres.join(', ') : "Inconnu")
                        embed.addField('Créateur(s)', (data.creators && data.creators.length > 0) ? data.creators.join(', ') : "Inconnu")
                        if(data.rating) embed.addField('Note', `${data.rating} (${numFormatter(data.rating_details.rating)} notes)`)
                        if(data.cover) embed.setImage(data.cover)

                        mes.edit({embed: embed})
                    }).catch(e => {
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`SensCritique - Une erreur est survenue`)
                            .setDescription(`Recherche : ${searchInput}`)
                            .setColor('#D33D33')
                            .setThumbnail(scLogo)

                        mes.edit({embed: embed})

                        console.error(e)
                    })
                } else {
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`SensCritique - Recherche annulé`)
                        .setDescription(`Recherche : ${searchInput}`)
                        .setColor('#D33D33')
                        .setThumbnail(scLogo)

                    mes.edit({embed: embed})
                }
            })
        }).catch(e => {
            let embed = new Discord.MessageEmbed()
                .setTitle(`SensCritique - Une erreur est survenue`)
                .setDescription(`Recherche : ${searchInput}`)
                .setColor('#D33D33')
                .setThumbnail(scLogo)

            mes.edit({embed: embed})
            mes.reactions.removeAll()

            console.error(e)
        })
    }
}