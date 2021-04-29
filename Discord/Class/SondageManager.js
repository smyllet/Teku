const fs = require('fs')

const Sondage = require('./Sondage')
const SondageOption = require('./SondageOption')

class SondageManager {
    /** @type {array<Sondage>} */
    static sondageList = []
    /** @type {Sondage} */
    static creationSondage

    /** @param {string} title
     *  @return {boolean} creationStatus */
    static initSondage(title) {
        if(this.creationSondage == null) {
            this.creationSondage = new Sondage(title)
            return true
        }
        else return false
    }

    /** @return {void} */
    static removeCreationSondage() {
        this.creationSondage = null
    }

    /** @return {Sondage} creationSondage */
    static getCreationSondage() {
        return this.creationSondage
    }

    /** @param {TextChannel} messageChannel
     *  @return {boolean} postStatus */
    static async postSondage(messageChannel) {
        if(this.creationSondage && (this.creationSondage.getOptions().length >= 2)) {
            await messageChannel.send(this.creationSondage.generateEmbed()).then((message) => {
                this.creationSondage.setMessage(message)

                this.creationSondage.getReact().forEach(async emote => {
                    await message.react(emote)
                })

                this.creationSondage.initExpireTimeout()
                this.sondageList.push(this.creationSondage)
                this.removeCreationSondage()

                this.saveInFile()

                return true
            }).catch(() => {
                return false
            })
        }
        else return false
    }

    /** @param {string} messageId
     *  @return {Sondage} sondage */
    static getSondageByMessageId(messageId) {
        return this.sondageList.find(sondage => sondage.getMessage().id === messageId)
    }

    /** @param {Sondage} sondage */
    static removeSondage(sondage) {
        this.sondageList.splice(this.sondageList.indexOf(sondage), 1)
        this.saveInFile()
    }

    /** @return {object} */
    static toJson() {
        return {
            sondageList: this.sondageList.map(sondage => sondage.toJson())
        }
    }

    /** @return {void} */
    static saveInFile() {
        let sondageFile = fs.createWriteStream(`${__dirname}/../../sondages.json`, {flags: 'w', encoding: "utf-8"})

        sondageFile.write(JSON.stringify(this.toJson()))
    }

    /** @param {Guild} guild */
    static async loadFromFile(guild) {
        let sondageFile

        try {
            sondageFile = fs.readFileSync(`${__dirname}/../../sondages.json`, 'utf-8')
        } catch (err) {}

        if(sondageFile) {
            let sondages = JSON.parse(sondageFile)
            if(sondages.sondageList) {
                await Promise.all(sondages.sondageList.map(async sondage => {
                    let channel = guild.channels.cache.find(channel => channel.id === sondage.channelId)
                    if(channel.id) {
                        await channel.messages.fetch(sondage.messageId).then(async message => {
                            if(message.id) {
                                let newSondage = new Sondage(sondage.title)
                                newSondage.setDescription(sondage.description)
                                sondage.options.forEach((option) => {
                                    newSondage.addOption(new SondageOption(option.emote, option.libelle))
                                })
                                newSondage.setMessage(message)
                                newSondage.setExpireTime(sondage.expireTime)

                                await newSondage.updateVote()

                                newSondage.update()
                                newSondage.initExpireTimeout()
                                this.sondageList.push(newSondage)
                            }
                        }).catch(() => {})
                    }
                }))

                this.saveInFile()
            }
        }
    }
}

module.exports = SondageManager