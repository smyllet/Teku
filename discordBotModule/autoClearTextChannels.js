config = require('../config.json')

channels = {}
let bot;

function clearTchat(idChannel)
{
    let guild = bot.guilds.cache.find(key => key.id === config.bot.discord.guildId) // Récupération du serveur Discord
    let channel = guild.channels.cache.find(key => key.id === idChannel)
    channel.messages.fetch()
        .then((messages) => {
            if(channels[idChannel].notRemoveFirstMessage) messages.delete(messages.lastKey()) // Suppression du premiers message des messages à supprimer si cela est défini dans les params
            if(messages.size > 0)
            {
                let count = 0

                messages.forEach(message => {
                    message.delete({timeout: 0, reason: "Nettoyage du salon " + channel.name}).catch(console.error)
                    count++
                })

                console.log(`Le salon ${channel.name} à été nettoyé, ${count} message(s) supprimé`)
            }

            if(channels[idChannel].timeout != null) clearTimeout(channels[idChannel].timeout) // Annulé le timeout en cours si il y en a un
            channels[idChannel].timeout = null
        })
        .catch(console.error)
}

exports.init = (dBot) => {
    bot = dBot // Récupération de l'instance du bot Discord

    for(let [key, value] of Object.entries(config.bot.discord.channels.text)) // Pour tout les channels text en config
    {
        if(value.autoClear && value.autoClear.active && value.autoClear.delay) // Si des param d'auto clear sont présent et qu'ils sont activé
        {
            channels[key] = {delay: value.autoClear.delay, notRemoveFirstMessage: value.autoClear.notRemoveFirstMessage, timeout: null}
            clearTchat(key)
        }
    }
}

exports.resetChannelTime = (idChannel) =>
{
    if(channels[idChannel]) // Si le salon ce trouve dans la liste des salons en auto clear
    {
        if(channels[idChannel].timeout != null) clearTimeout(channels[idChannel].timeout) // Annulé le timeout en cours si il y en a un
        channels[idChannel].timeout = setTimeout(() => clearTchat(idChannel), channels[idChannel].delay) // Créer un nouveau timeout
    }
}