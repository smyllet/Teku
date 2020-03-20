const func = require('../addon/fonction')
var request = require('request')
const cheerio = require('cheerio')
const Discord = require('discord.js')

module.exports = {
    name: 'senscritique',
    description: "Optenir une fiche complète sur une oeuvre",
    guildOnly: false,
    args: true,
    usage: '[-film *ou* -serie *ou* -jeu *ou* -livre *ou* -bd *ou* -morceau *ou* -album (si vide, recherche dans toutes les catégories)] <oeuvre>',
    aliases: ['sc'],
    permition: [1],
    enable: true,
    async execute(message,args,db,permitionUser) {
        //- - - - - Initialisation des variable - - - - -//
        typeOfNote = new Discord.Collection()
            .set('film','Film')
            .set('jeuvideo','Jeu vidéo')
            .set('serie','Série')
            .set('livre','Livre')
            .set('bd','BD')
            .set('morceau','Morceau')
            .set('album','Album')
        
        let Data = {}
        Data.genre = []
        Data.by = []
        
        //- - - - - Filtre de recherche - - - - -//
        searchType = ''
        if(args[0].startsWith('-'))
        {
            searchType = '&categories[0][0]='

            switch (args[0].toUpperCase())
            {
                case '-FILM':
                    searchType += 'Films'
                    break
                case '-SERIE':
                    searchType += 'Séries'
                    break
                case '-JEU':
                    searchType += 'Jeux'
                    break
                case '-LIVRE':
                    searchType += 'Livres'
                    break
                case '-BD':
                    searchType += 'BD'
                    break
                case '-MORCEAU':
                    searchType += 'Morceaux'
                    break
                case '-ALBUM':
                    searchType += 'Albums'
                    break
                default:
                    return message.channel.send(`Le type d'oeuvre recherché est invalide, veuillez choisir entre Film, Serie, Jeu, Livre, BD, Morceau, Album`)
            }
            args.splice(0,1) //recalcule des arguments
        }

        //- - - - - Vérification présence d'une oeuvre à recherché - - - - -//
        if (args.length == 0) return message.channel.send(`Aucun nom d'oeuvre n'a été donné`)

        //- - - - - Message de recherche - - - - -//
        msg = await message.channel.send(`:mag: Recherche en cours . . .`)

        //- - - - - En cas de non réponse - - - - -//
        setTimeout(function(){
            if(msg.editedAt == null) return msg.edit(`Echec de communication avec SensCritique`)
        },60000)


        //- - - - - Recherche de l'oeuvre - - - - -//
        searchURL = encodeURI(`https://www.senscritique.com/search?q=${args.join(' ')}${searchType}`)
        
        request(searchURL, function (error, response, body) {
            if(error || (response.statusCode != 200))
            {
                func.log('err',error)
                return msg.edit('Erreur lors de la communication avec SensCritique')
            }
            else
            {
                let $ = cheerio.load(body)
                let links = []

                //- - - - - Récupération des résultat de la recherche - - - - -//
                $('a').each(function (i,e) {
                    if ($(this).attr('href'))
                    {
                        if($(this).attr('href').includes('https://www.senscritique.com/serie/') || $(this).attr('href').includes('https://www.senscritique.com/film/') || $(this).attr('href').includes('https://www.senscritique.com/jeuvideo/') || $(this).attr('href').includes('https://www.senscritique.com/livre/') || $(this).attr('href').includes('https://www.senscritique.com/bd/') || $(this).attr('href').includes('https://www.senscritique.com/morceau/') || $(this).attr('href').includes('https://www.senscritique.com/album/'))
                        {
                            links[i] = $(this).attr('href')
                        }
                    }
                })

                //- - - - - Suppression des faux résultat - - - - -//
                let linksDef = []

                for (let i = 0; i < links.length; i++)
                {
                    if (links[i] != (undefined || null) )
                    {
                        let temp3 = links[i].split('/')
                        let temp4 = temp3[3]
                        if (links[i].includes('https') && (links[i] != 'https://www.senscritique.com/bd/oeuvres') && (links[i] != 'https://www.senscritique.com/musique/oeuvres')) linksDef.push(links[i])
                    }
                }

                //- - - - - Si aucun résultat - - - - -//
                if(linksDef.length == 0)
                {
                    if (searchType == '') return msg.edit(`Aucun résultat pour ${args.join(' ')}`)
                    else return msg.edit(`Aucun résultat pour ${args.join(' ')} dans la catégorie ${searchType.substr(18)}`)
                }

                //- - - - - Récupération des données de l'oeuvre - - - - -//
                oeuvreURL = encodeURI(linksDef[0])
                request(oeuvreURL, function(error, response, body) {
                    if(error || (response.statusCode != 200))
                    {
                        func.log('err',error)
                        return msg.edit('Erreur lors de la communication avec SensCritique')
                    }
                    else
                    {
                        let $ = cheerio.load(body)

                        $('*').each(function (i,e) {
                            if ($(this).attr('itemprop'))
                            {
                                switch ($(this).attr('itemprop'))
                                {
                                    case 'ratingCount':
                                        Data.ratingCount = $(this).attr('content')
                                        break
                                    case 'datePublished':
                                        if($(this).attr('content')) Data.datePublish = $(this).attr('content')
                                        break
                                    case 'description':
                                        if($(this).attr('data-rel') == 'small-resume')
                                        {
                                            Data.resume = $(this).text().replace('\t\t\t\t\tLire la suite\n\t\t\t\t','')
                                        }
                                        break
                                    case 'image':
                                        if(($(this).attr('class') == 'pvi-hero-poster') && $(this).attr('src')) Data.image = $(this).attr('src')
                                        break
                                    case 'name':
                                        if(($(this).attr('class') == 'pvi-product-title ') && $(this).attr('title')) Data.title = $(this).attr('title')
                                        break
                                    case 'genre':
                                        Data.genre.push($(this).text())
                                        break
                                    case 'ratingValue':
                                        if($(this).attr('class') == 'pvi-scrating-value') Data.rate = $(this).text()
                                        break
                                }

                                if (($(this).attr('itemprop') == 'creator') || ($(this).attr('itemprop') == 'director') || ($(this).attr('itemprop') == 'illustrator'))
                                {
                                    let temp = $(this).text()
                                    while(temp[0] == ' ')
                                    {
                                        temp = temp.substr(1)
                                    }
                                    Data.by.push(temp)
                                }
                            }

                            if($(this).attr('class') && ($(this).attr('class') == 'pvi-productDetails-item'))
                            {
                                if($(this).children().attr('itemprop') == 'duration')
                                {
                                    let temp = $(this).text().split('')
                                    let temp2 = []
                                    
                                    for(value of temp)
                                    {
                                        if ((value != '\n') && (value != '\t') && (value != 'm') && (value != 'i') && (value != 'n') && (value != ' '))
                                        {
                                            temp2.push(value)
                                        }
                                    }

                                    Data.duration = temp2.join('')
                                    if(!$(this).text().includes('h')) Data.duration = Data.duration + ' minutes'
                                }
                                else if($(this).text().includes('saison'))
                                {
                                    let temp = $(this).text().split('')
                                    let temp2 = []
                                    
                                    for(value of temp)
                                    {
                                        if ((value != '\n') && (value != '\t'))
                                        {
                                            temp2.push(value)
                                        }
                                    }

                                    Data.saison = temp2.join('')
                                }
                            }
                        })

                        let typeTemp = oeuvreURL.split('/')
                        Data.type = typeOfNote.get(typeTemp[3])

                        //- - - - - Retourné la fiche - - - - -//
                        fiche = new Discord.RichEmbed()
                            .setColor('#0CD46C')
                            .setThumbnail('https://static.senscritique.com/img/about/logo-sc.png')
                            .setURL(oeuvreURL)
                            .setTimestamp()
                        
                        if(Data.title && (Data.title != ''))
                        {
                            fiche.setTitle(Data.title)
                            fiche.setFooter(`${Data.title} - SensCritique`)
                        }

                        if(Data.resume && (Data.resume != '')) fiche.setDescription(Data.resume)

                        if(Data.image && (!Data.image.includes('missing.jpg'))) fiche.setImage(Data.image)

                        if(Data.type && (Data.type != '')) fiche.addField('Type',Data.type)
                        
                        if(Data.datePublish && (Data.datePublish != ''))
                        {
                            var months_arr = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
                            let tm = Data.datePublish.split('-')
                            if(parseInt(tm[2]) == 0) tm.splice(2)
                            if(parseInt(tm[1]) == 0) tm.splice(1)
                            if(tm[1]) tm[1] = months_arr[parseInt(tm[1])-1]
                            tm = tm.reverse()

                            fiche.addField('Sortie',tm.join(' '))
                        }

                        if(Data.genre && (Data.genre != '')) fiche.addField('Genre',Data.genre.join(', '))

                        if(Data.by && (Data.by != '')) fiche.addField('De',Data.by.join(', '))

                        if(Data.duration && (Data.duration != '')) fiche.addField('Durée',Data.duration)

                        if(Data.saison && (Data.saison != '')) fiche.addField('Saisons',Data.saison)

                        if(Data.rate && (Data.rate != ''))
                        {
                            if(Data.ratingCount && (Data.ratingCount != '')) fiche.addField('Note',`${Data.rate} (${Data.ratingCount} notes)`)
                            else fiche.addField('Note',`${Data.rate}`)
                        }

                        return msg.edit({embed : fiche})
                    }
                })
            }
        })
    }
}