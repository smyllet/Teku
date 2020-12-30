config = require('../../config.json')

let role = null

exports.init = (bot) => {
    role = bot.guilds.cache.find(key => key.id === config.bot.discord.guildId).roles.cache.find(key => key.id === config.bot.discord.roles.membre.id) // Récupération du role membre

    this.refreshRole() // Réactualisation des membres
}

exports.refreshRole = () => {
    role.guild.members.cache.forEach(member => this.addRoleToMember(member)) // Ajout du role à tout les membres
}

exports.addRoleToMember = (member) => {
    if(!member.user.bot) member.roles.add(role).catch(console.error)
}