const config = require('../../config.json')

class Command
{
    /** @param {string} name
     *  @param {string} parent
     *  @param {null} parent
     *  @param {string} description
     *  @param {string} syntax
     *  @param {array<Object>} options
     *  @param {boolean} enable
     *  @param {boolean} argsRequire
     *  @param {string} role
     *  @param {function} execute
     *  @param {CommandManager} subCommands
     *  @return {void} */
    constructor(name, parent, description, syntax, options, enable, argsRequire, role, execute, subCommands)
    {
        let roleId
        if(config.bot.discord.roles[role]) roleId = config.bot.discord.roles[role].id
        else if (role === "everyone") roleId = 0
        else roleId = null

        this.name = name
        this.parent = parent
        this.description = description
        this.syntax = syntax
        this.options = options
        this.enable = enable
        this.argsRequire = argsRequire
        this.role = roleId
        this.execute = execute
        this.subCommands = subCommands
    }

    /** @return {boolean} */
    isExecutable()
    {
        return !(!this.execute);
    }

    /** @param {GuildMember} member
     *  @return {boolean} hasPermission */
    hasPermission(member)
    {
        if(this.role === 0) return true
        else return !!member.roles.cache.find(role => role.id === this.role)
    }

    /** @return {string} fullCommandeName */
    getFullName()
    {
        if(this.parent) return this.parent + " " + this.name
        else return this.name
    }

    /** @return {string} syntax */
    getSyntax()
    {
        return config.bot.discord.commandPrefix + this.syntax
    }

    /** @return {any} slashData */
    getSlashData()
    {
        let data = {}
        data.name = this.name
        data.description = this.description
        data.defaultPermission = (this.role === 0)

        if(this.subCommands) {
            data.options = this.subCommands.getSubSlashData()
        }

        if(this.options) {
            if(!data.options) data.options = []
            this.options.forEach(op => data.options.push(op))
        }

        return data
    }

    /** @return {any} slashData */
    getSubSlashData()
    {
        let data = {}
        data.name = this.name
        data.description = this.description
        data.type = 'SUB_COMMAND'

        if(this.options) {
            data.options = []
            this.options.forEach(op => data.options.push(op))
        }

        return data
    }
}

module.exports = Command