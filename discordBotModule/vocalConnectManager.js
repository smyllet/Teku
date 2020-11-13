config = require('../config.json')

let role = null

exports.init = (bot) => {
    role = bot.guilds.cache.find(key => key.id === config.bot.discord.guildId).roles.cache.find(key => key.id === config.bot.discord.roles.vocalConnect.id) // Récupération du role vocal-connect

    this.refreshRole() // Réactualisation des membres possèdant le role vocal-connect
}

exports.refreshRole = () => {
    role.members.forEach(member => member.roles.remove(role).catch(console.error)) // Suppression du role sur tout les membres qui le possède
    role.guild.voiceStates.cache.forEach(voiceState => voiceState.member.roles.add(role).catch(console.error)) // Ajout du role à tout les membres connecté en vocal
}

exports.addRoleToMember = (member) => {
    member.roles.add(role).catch(console.error)
}

exports.removeRoleToMember = (member) => {
    member.roles.remove(role).catch(console.error)
}