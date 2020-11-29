const config = require('../../config.json')

class Command
{
    constructor(name, parent, description, syntax, enable, argsRequire, role, execute, subCommands)
    {
        let roleId
        if(config.bot.discord.roles[role]) roleId = config.bot.discord.roles[role].id
        else if (role === "everyone") roleId = 0
        else roleId = null

        this.name = name
        this.parent = parent
        this.description = description
        this.syntax = syntax
        this.enable = enable
        this.argsRequire = argsRequire
        this.role = roleId
        this.execute = execute
        this.subCommands = subCommands
    }

    isExecutable(args)
    {
        return !((this.argsRequire && (args.length < 1)) || !this.execute);
    }

    hasPermission(member)
    {
        if(this.role === 0) return true
        else return !!member.roles.cache.find(role => role.id === this.role)
    }

    getFullName()
    {
        if(this.parent) return this.parent + " " + this.name
        else return this.name
    }

    getSyntax()
    {
        return config.bot.discord.commandPrefix + this.syntax
    }
}

module.exports = Command