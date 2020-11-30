const fs = require("fs")



function writeLog(log)
{
    let date = new Date()

    let day = ("0" + date.getDate()).slice(-2)
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let year = date.getFullYear()

    let string_date = `${year}-${month}-${day}`

    let log_file = fs.createWriteStream(`${__dirname}/../Logs/${string_date}.log`, {flags: 'a'})

    log_file.write(log + "\n")
}

function getDate()
{
    let date = new Date()

    let day = ("0" + date.getDate()).slice(-2)
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let year = date.getFullYear()

    return `${year}-${month}-${day}`
}

function getDateAndTime()
{
    let date = new Date()

    let day = ("0" + date.getDate()).slice(-2)
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let year = date.getFullYear()

    let hour = ("0" + date.getHours()).slice(-2)
    let minutes = ("0" + date.getMinutes()).slice(-2)
    let seconde = ("0" + date.getSeconds()).slice(-2)

    return `${year}-${month}-${day} ${hour}:${minutes}:${seconde}`
}

exports.info = (content) => {
    console.log('\x1b[37m' + getDateAndTime() + ' \x1b[36minfo \x1b[37m: ' + content)
    writeLog(`${getDateAndTime()} info : ${content}`)
}

exports.err = (content) => {
    console.log('\x1b[37m' + getDateAndTime() + ' \x1b[31merror \x1b[37m: ' + content)
    writeLog(`${getDateAndTime()} error : ${content}`)
}

exports.warn = (content) => {
    console.log('\x1b[37m' + getDateAndTime() + ' \x1b[33mwarn \x1b[37m: ' + content)
    writeLog(`${getDateAndTime()} warn : ${content}`)
}