module.exports = {
    name: "coin",
    description: "Pile ou face ?",
    syntax: "coin",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(message) {
        message.channel.send(`La pièce est lancé !\nElle retombe . . .\nEt c'est : ${(Math.floor(Math.random() * Math.floor(2)) ===1) ? 'Pile !' : 'Face !'}`)
    }
}