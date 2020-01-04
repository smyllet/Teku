const fs = require('fs')

exports.cmdImport = function ()
{
    let file = fs.readdirSync('./commande/').toString()
    let splitFile = file.split(',')

    for (i = splitFile.length; i > 0; i--)
    {
        if(splitFile[i-1].indexOf(".") == -1)
        {
            
            message.channel.send("Dossier : " + splitFile[i-1])
        }
        else
        {
            message.channel.send("Fichier : " + splitFile[i-1])
        }
    }
}