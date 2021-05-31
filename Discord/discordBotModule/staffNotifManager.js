config = require('../../config.json')

let channel = null

exports.init = (bot) => {
    channel = bot.guilds.cache.find(key => key.id === config.bot.discord.guildId).channels.cache.find(key => key.id === config.bot.discord.staffNotificationChannel) // Récupération channel de notification
}

/** @return Message */
exports.sendNotif = async (message) => {
    return await channel.send(message).catch(console.error)
}