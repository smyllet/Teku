config = require('../../config.json')

exports.initCreationMessage = async (message) => {
    // pin le message
    await message.pin()

    // Supprimer le message de pin
    message.channel.messages.fetch({limit: 1}).then((messages) => {
        let pinMessage = messages.last()
        if(pinMessage.type === "PINS_ADD") pinMessage.delete({timeout: 2000})
    })

    // retiré toute les réaction potentiellement existante (normalement ne sert à rien mais on sais jamais)
    await message.reactions.removeAll()

    // Ajouter les réactions sous le messages
    await config.bot.discord.creation.react.forEach((react) => {
        message.react(react)
    })
}

exports.cancelCreationMessage = async (message) => {
    // pin le message
    await message.unpin()

    // retiré toute les réaction potentiellement existante
    await message.reactions.removeAll()
}

exports.resetCreationMessage = async (message) => {
    // retiré toute les réaction potentiellement existante
    await message.reactions.removeAll()

    // Ajouter les réactions sous le messages
    await config.bot.discord.creation.react.forEach((react) => {
        message.react(react)
    })
}