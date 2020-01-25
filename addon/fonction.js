const func = require('./fonction.js') //fonction
const fs = require('fs') //File système
const Discord = require('discord.js')

var now = new Date()

exports.convertDate = function (time) 
{
    if (time) date = new Date(time)
    else date = new Date()
    
    
    let Hour = ""

    let y = date.getFullYear()
    let M = date.getMonth()+1
    let d = date.getDate()
    
    let h = date.getHours()
    let m = date.getMinutes()
    let s = date.getSeconds()

    if (y < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + y + "-"

    if (M < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + M + "-"

    if (d < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + d + " "

    if (h < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + h + ":"

    if (m < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + m + ":"

    if (s < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + s
    
    return Hour
    
}

exports.convertDateOnly = function (time)
{
    if (time) date = new Date(time)
    else date = new Date()
    
    
    let dateToReturn = ""

    let y = date.getFullYear()
    let M = date.getMonth()+1
    let d = date.getDate()

    if (y < 10) {
        dateToReturn = dateToReturn + "0"
    }
    dateToReturn = dateToReturn + y + "-"

    if (M < 10) {
        dateToReturn = dateToReturn + "0"
    }
    dateToReturn = dateToReturn + M + "-"

    if (d < 10) {
        dateToReturn = dateToReturn + "0"
    }
    dateToReturn = dateToReturn + d + " "

    return dateToReturn
}

exports.convertDateRead = function (time) 
{
    if (time) date = new Date(time)
    else date = new Date()
    
    var months_arr = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
    
    let Hour = "Le "

    let y = date.getFullYear()
    let M = date.getMonth()
    let d = date.getDate()
    
    let h = date.getHours()
    let m = date.getMinutes()
    let s = date.getSeconds()

    if (d < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + d + ` ${months_arr[M]} ${y} à `

    if (h < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + h + ":"

    if (m < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + m + ":"

    if (s < 10) {
        Hour = Hour + "0"
    }
    Hour = Hour + s
    
    return Hour
    
}

exports.log = function (type, data)
{
    try
    {
        let log_file = fs.createWriteStream(`${__dirname}/../logs/${func.convertDateOnly()}.log`, {flags : 'a'})
        
        if (type == 'err') {
            console.log('\x1b[37m[' + func.convertDate() + '] \x1b[31m[Erreur] \x1b[37m: ' + data)
            log_file.write(`[${func.convertDate()}] [Erreur] : ${data}\n`)
        }
        if (type == 'warn') {
            console.log('\x1b[37m[' + func.convertDate() + '] \x1b[33m[Attention] \x1b[37m: ' + data)
            log_file.write(`[${func.convertDate()}] [Attention] : ${data}\n`)
        }
        if (type == 'info') {
            console.log('\x1b[37m[' + func.convertDate() + '] \x1b[36m[Info] \x1b[37m: ' + data)
            log_file.write(`[${func.convertDate()}] [Info] : ${data}\n`)
        }
        if (type == 'cmd') {
            console.log('\x1b[37m[' + func.convertDate() + '] \x1b[35m[Commande] \x1b[37m: ' + data)
            log_file.write(`[${func.convertDate()}] [Commande] : ${data}\n`)
        }
        if (type == 'vocal') {
            console.log('\x1b[37m[' + func.convertDate() + '] \x1b[32m[Salons Vocaux] \x1b[37m: ' + data)
            log_file.write(`[${func.convertDate()}] [Salons Vocaux] : ${data}\n`)
        }
    }
    catch(error)
    {
        console.error(error)
    }
}

exports.facteurPremier = function(number)
{
    let nbPrems = [2,3,5,7,11,13]
    let result = [1]
    for (var i = nbPrems.length; i > 0; i){
        if (number % nbPrems[i-1] === 0){
            result.push(nbPrems[i-1])
            number = number / nbPrems[i-1]

            i = nbPrems.length
        }
        else{
            i--
        }
    }

    return result
}

exports.havePermition = function(userPermition,CmdPermition)
{
    userPermitionList = func.facteurPremier(userPermition)
    for (var i = CmdPermition.length; i >= 0; i--)
    {
        if(userPermitionList.includes(CmdPermition[i])) return true
    }
    return false
}

exports.msToTime = function(duration)
{
    if(isNaN(duration)) return '0'
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
} 