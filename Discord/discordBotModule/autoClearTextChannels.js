const logs = require("../../Global/module/logs");
const config = require('../../config.json')

channels = {}
let bot;

async function clearTchat(idChannel)
{
    let guild = bot.guilds.cache.find(key => key.id === config.bot.discord.guildId) // Récupération du serveur Discord
    let channel = guild.channels.cache.find(key => key.id === idChannel)
    channel.messages.fetch({limit: 100})
        .then((messages) => {
            let nb = messages.size
            if(channels[idChannel].notRemoveFirstMessage) nb = messages.size - 1 // Suppression du premiers message des messages à supprimer si cela est défini dans les params
            if(nb > 0)
            {
                channel.bulkDelete(nb, true)
                    .then(m => {
                        logs.info(`Le salon ${channel.name} à été nettoyé, ${m.size} message(s) supprimé`)
                        if(m.size === ((channels[idChannel].notRemoveFirstMessage) ? 99 : 100)) clearTchat(idChannel)
                    })
                    .catch(error => logs.err(error))
            }

            if(channels[idChannel].timeout != null) clearTimeout(channels[idChannel].timeout) // Annulé le timeout en cours si il y en a un
            channels[idChannel].timeout = null
        })
        .catch(err => logs.err(err.toString()))
}

exports.init = (dBot) => {
    bot = dBot // Récupération de l'instance du bot Discord

    for(let [key, value] of Object.entries(config.bot.discord.channels.text)) // Pour tout les channels text en config
    {
        if(value.autoClear && value.autoClear.active && value.autoClear.delay) // Si des param d'auto clear sont présent et qu'ils sont activé
        {
            channels[key] = {delay: value.autoClear.delay, notRemoveFirstMessage: value.autoClear.notRemoveFirstMessage, timeout: null}
            clearTchat(key).then()
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