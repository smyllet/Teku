const func = require('../addon/fonction')

module.exports = {
    name: 'coin',
    description: "pile ou face ?",
    guildOnly: true,
    args: false,
    permition: [1],
    enable: true,
    execute(message,args,db,permitionUser) {
        let coin = Math.floor(Math.random() * Math.floor(2))
        if (coin == 1) message.channel.send('Pile !')
        else message.channel.send('Face !')
    }
}