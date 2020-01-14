const func = require('../addon/fonction.js') //fonction
var request = require('request')
const fs = require('fs')
const cheerio = require('cheerio')
const Discord = require('discord.js')

module.exports = {
    name: 'sens-critique',
    description: 'Command de test',
    guildOnly: false,
    args: true,
    usage: '<ALL|FILM|SERIE|JEU|LIVRE|BD|MORCEAU|ALBUM> <oeuvre>',
    aliases: ['sc'],
    permition: [2],
    enable: true,
    execute(message,args) {
        typeOfNote = new Discord.Collection()
        typeOfNote
            .set('film','Film')
            .set('jeuvideo','Jeu vidéo')
            .set('serie','Série')
            .set('livre','Livre')
            .set('musique', 'Musique')
            .set('bd','BD')
            .set('morceau','Morceau')
            .set('album','Album')


        //Check type of search
        searchType = '&categories[0][0]='
        switch (args[0].toUpperCase()) {
            case 'ALL':
                searchType = ''
                break
            case 'FILM':
                searchType += 'Films'
                break
            case 'SERIE':
                searchType += 'Séries'
                break
            case 'JEU':
                searchType += 'Jeux'
                break
            case 'LIVRE':
                searchType += 'Livres'
                break
            case 'BD':
                searchType += 'BD'
                break
            case 'MORCEAU':
                searchType += 'Morceaux'
                break
            case 'ALBUM':
                searchType += 'Albums'
                break
            default:
                return message.channel.send(`Le type d'oeuvre recherché est invalide`)
        }

        args.splice(0,1)

        request(`https://www.senscritique.com/search?q=${args.join(' ')}${searchType}`, function (error, response, body) {
            if(error || (response.statusCode != 200))
            {
                func.log('err',error)
                message.channel.send('Erreur lors de la communication avec SensCritique')
            }
            else
            {
                let $ = cheerio.load(body)
                let links = []

                $('a').each(function (i,e) {
                    if ($(this).attr('href'))
                    {
                        if($(this).attr('href').includes('https://www.senscritique.com/serie/') || $(this).attr('href').includes('https://www.senscritique.com/film/') || $(this).attr('href').includes('https://www.senscritique.com/jeuvideo/') || $(this).attr('href').includes('https://www.senscritique.com/livre/') || $(this).attr('href').includes('https://www.senscritique.com/bd/') || $(this).attr('href').includes('https://www.senscritique.com/morceau/') || $(this).attr('href').includes('https://www.senscritique.com/album/') || $(this).attr('href').includes('https://www.senscritique.com/musique/'))
                        {
                            links[i] = $(this).attr('href')
                        }
                    }
                })

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

                if (!linksDef[0]) return message.channel.send("Aucun résultat . . .")
                

                request(linksDef[0], function(error, response, body) {
                    if(error || (response.statusCode != 200))
                    {
                        func.log('err',error)
                        message.channel.send('Erreur lors de la communication avec SensCritique')
                    }
                    else
                    {
                        let $ = cheerio.load(body)
                        let Data = {}

                        $('meta').each(function (i,e) {
                            if ($(this).attr('itemprop'))
                            {
                                switch ($(this).attr('itemprop'))
                                {
                                    case 'ratingCount':
                                        Data.ratingCount = $(this).attr('content')
                                        break
                                    case 'datePublished':
                                        Data.datePublish = $(this).attr('content')
                                        break
                                }
                            }
                        })

                        $('p').each(function (i,e) {
                            if ($(this).attr('itemprop') && $(this).attr('data-rel'))
                            {
                                if(($(this).attr('itemprop') == 'description') && ($(this).attr('data-rel') == 'small-resume'))
                                {
                                    Data.resume = $(this).text()
                                }
                            }
                        })

                        $('h1').each(function (i,e) {
                            if ($(this).attr('itemprop') && $(this).attr('class'))
                            {
                                if(($(this).attr('itemprop') == 'name') && ($(this).attr('class') == 'pvi-product-title '))
                                {
                                    Data.title = $(this).attr('title')
                                }
                            }
                        })

                        $('img').each(function (i,e) {
                            if ($(this).attr('itemprop') && $(this).attr('class'))
                            {
                                if(($(this).attr('itemprop') == 'image') && ($(this).attr('class') == 'pvi-hero-poster'))
                                {
                                    Data.image = $(this).attr('src')
                                }
                            }
                        })

                        $('li').each(function (i,e) {
                            if ($(this).attr('class'))
                            {
                                if ($(this).attr('class') == 'pvi-productDetails-item')
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
                            }
                        })

                        Data.genre = []
                        Data.by = []

                        $('span').each(function (i,e) {
                            if ($(this).attr('itemprop'))
                            {
                                switch ($(this).attr('itemprop'))
                                {
                                    case 'genre':
                                        Data.genre.push($(this).text())
                                        break
                                    case 'ratingValue':
                                        if($(this).attr('class') == 'pvi-scrating-value')
                                        {
                                            Data.rate = $(this).text()
                                        }
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
                        })
                        
                        let typeTemp = linksDef[0].split('/')
                        Data.type = typeOfNote.get(typeTemp[3])


                        //Retourné resultat
                        fiche = new Discord.RichEmbed()
                            .setColor('#0CD46C')
                            .setThumbnail('https://static.senscritique.com/img/about/logo-sc.png')
                            .setURL(linksDef[0])
                            .setTimestamp()
                        
                        if(Data.title && (Data.title != ''))
                        {
                            fiche.setTitle(Data.title)
                            fiche.setFooter(`${Data.title} - Sens Critique`)
                        }

                        if(Data.resume && (Data.resume != '')) fiche.setDescription(Data.resume)

                        if(Data.image) fiche.setImage(Data.image)

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

                        message.channel.send({embed : fiche})

                    }
                })


            }
        })
    }
}