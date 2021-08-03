module.exports = {
    name: "coin",
    description: "Pile ou face ?",
    syntax: "coin",
    enable: true,
    argsRequire: false,
    role: "everyone",
    async execute(interaction) {
        interaction.reply(`La pièce est lancée !\nElle retombe . . .\nEt c'est : ${(Math.floor(Math.random() * Math.floor(2)) ===1) ? 'Pile !' : 'Face !'}`)
    }
}