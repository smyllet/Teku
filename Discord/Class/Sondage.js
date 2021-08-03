const discord = require('discord.js')

class Sondage {
    /** @type {string} */
    title
    /** @type {string} */
    description
    /** @type {array<SondageOption>} */
    options
    /** @type {Message} */
    message
    /** @type {int} */
    expireTime

    /** @type {Timeout} */
    expireTimeout

    /** @param {string} title */
    constructor(title) {
        this.title = title
        this.description = ""
        this.options = []

        let date = new Date()
        date.setDate(date.getDate()+1)
        this.expireTime = date.getTime()
    }

    /** @param {string} title
     *  @return void */
    setTitle(title) {
        this.title = title
    }

    /** @return {string} title */
    getTitle() {
        return this.title
    }

    /** @param {string} description
     *  @return void */
    setDescription(description) {
        this.description = description
    }

    /** @return {string} description */
    getDescription() {
        return this.description
    }

    /** @param {Message} message
     *  @return {void} */
    setMessage(message) {
        this.message = message
    }

    /** @return {Message} message */
    getMessage() {
        return this.message
    }

    /** @param {int} expireTime
     *  @return {void} */
    setExpireTime(expireTime) {
        this.expireTime = expireTime
    }

    /** @return {int} expireTime */
    getExpireTime() {
        return this.expireTime
    }

    /** @param {SondageOption} option
     *  @return {void} */
    addOption(option) {
        this.options.push(option)
    }

    /** @param {SondageOption} option
     *  @return {void} */
    removeOption(option) {
        this.options.splice(this.options.indexOf(option), 1)
    }

    /** @return {Array<SondageOption>} options */
    getOptions() {
        return this.options;
    }

    /** @param {string} emote
     *  @return {SondageOption} option */
    getOptionByEmote(emote) {
        return this.options.find(option => option.emote === emote)
    }

    /** @return {void} */
    resetAllVotes() {
        return this.options.forEach(option => option.reset())
    }

    /** @param {boolean} expire
     *  @return {MessageEmbed} sondageEmbed */
    generateEmbed(expire = false) {
        let embed =  new discord.MessageEmbed()
            .setTitle(`Sondage - ${this.getTitle()}`)
            .setDescription(this.getDescription())

        if(expire) {
            embed.setFooter('Terminé')
            embed.setTimestamp()
        } else {
            embed.setFooter('En cours')
            embed.setColor('#FBFCF7')
            embed.setTimestamp(this.getExpireTime())
        }

        this.options.forEach(option => {
            let nbVote = option.getNbVote()
            let percent = this.calculPercentVote(nbVote)

            embed.addField(`${option.getEmote()} ${option.getLibelle()}`, `${this.generatePercentBar(percent)} ${percent}% (${nbVote}/${this.getNbVote()})`)
        })

        return embed
    }

    /** @return {array<string>} emotes */
    getReact() {
        return this.options.map(option => option.emote)
    }

    /** @return {int} nbVote */
    getNbVote() {
        if(this.getOptions().length < 1) return 0
        else return this.getOptions().map(option => option.getNbVote()).reduce((accumulator, currentValue) => accumulator + currentValue)
    }

    /** @param {int} nbVote
     *  @return {int} votePercent */
    calculPercentVote(nbVote) {
        let nbTotalVote = this.getNbVote()

        if(nbTotalVote < 1) return 0
        else return Math.round(nbVote/nbTotalVote*100)
    }

    /** @param {int} percent
     *  @return {string} percent */
    generatePercentBar(percent) {
        let result = ""

        for(let i = 1; i <= 10; i++) {
            if(Math.round(percent/10) >= i) result += '◻'
            else result += '◼'
        }

        return result
    }

    /** @return {void} */
    async update() {
        if(this.message) {
            await this.message.edit({embeds: [this.generateEmbed()]})
        }
    }

    /** @return {void} */
    async updateVote() {
        // Si il y a bien un message associer au sondage
        if (this.message) {
            // Effacer les votes
            this.resetAllVotes()

            // Pour chaque réaction au message
            let reactions = this.message.reactions.cache
            await Promise.all(reactions.map(async (messageReaction, emote) => {
                // Récupération emote custom
                let emoji = this.message.guild.emojis.cache.find(emoji => emoji.id === emote)
                if(emoji) emote = emoji.toString()

                // Récupéré l'option associer à la réaction
                let option = this.getOptionByEmote(emote)

                // Si une option à été trouvé
                if (option) {
                    // Pour cache utilisateur
                    await messageReaction.users.fetch()
                    await messageReaction.users.cache.forEach(user => {
                        // Si ce n'est pas un bot
                        if (!user.bot) {
                            // Récupéré les réactions de l'utilisateur
                            let reactOfUser = this.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id))

                            // Si l'utilisateur à plus d'une réaction
                            if (reactOfUser.size > 1) {
                                // Supprimé les réaction de l'utilisateur
                                for (let react of reactOfUser.values()) {
                                    react.users.remove(user.id)
                                }
                            } else {
                                // Ajouter une réaction
                                option.up()
                            }
                        }
                    })
                } else await messageReaction.remove()
            }))
        }
    }

    /** @return {object} */
    toJson() {
        return {
            title: this.title,
            description: this.description,
            options: this.options.map(option => option.toJson()),
            channelId: (this.message) ? this.message.channel.id : null,
            messageId: (this.message) ? this.message.id : null,
            expireTime: this.expireTime
        }
    }

    /** @return {void} */
    initExpireTimeout() {
        clearTimeout(this.expireTimeout)

        let now = new Date()

        if(this.isExpire()) {
            this.expire()
        } else {
            this.expireTimeout = setTimeout(() => {
                if(this.isExpire()) this.expire()
                else this.initExpireTimeout()
            }, this.expireTime - now.getTime())
        }
    }

    /** @return {boolean} isExpire */
    isExpire() {
        let now = new Date()

        return (this.expireTime - now.getTime()) < 1
    }

    /** @return {void} */
    async expire() {
        if(this.message) {
            await this.message.reactions.removeAll()
            await this.message.edit({embeds: [this.generateEmbed(true)]})
        }
    }
}

module.exports = Sondage