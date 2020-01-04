const func = require('../addon/fonction')

module.exports = {
    name: 'visio',
    description: "Optention du lien pour les partages d'ecran et cam sur salon vocaux",
    guildOnly: true,
    args: false,
    usage: '',
    permition: [1],
    enable: true,
    execute(message,args,db,permitionUser) {
        voiceChannel = message.member.voiceChannelID
        if (!voiceChannel) return message.channel.send("vous devez être dans un salon vocal pour pouvoir optenir son lien de partage d'écran / webcam")
        message.channel.send('Utilisez ce lien pour vous connecter au salon vocal **"' + message.member.voiceChannel.name + '"**' + " et avoir accès au partage d'écran et webcam de ce salon (Attention cela n'est pas disponible sur téléphone).\n:warning: ATTENTION vous aller rejoindre le vocal en cliquant sur ce lien :warning: \n  " + 'https://discordapp.com/channels/'+ message.guild.id + '/' + voiceChannel);
    }
}