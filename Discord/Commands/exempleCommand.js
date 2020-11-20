module.exports = {
    name: "nom_de_la_commande",
    description: "description de la commande",
    syntax: "nom_de_la_commande [add|remove|list]",
    enable: false,
    argsRequire: false,
    role: "everyone",
    subCommands:
        {
            add:
                {
                    name: "add",
                    description: "",
                    syntax: "nom_de_la_commande add (args variable)",
                    enable: true,
                    argsRequire: true,
                    role: "everyone",
                    execute(message, args) {
                        // commande à exécuté
                    }
                },
            remove:
                {
                    name: "remove",
                    description: "",
                    syntax: "nom_de_la_commande remove (@pseudo)",
                    enable: false,
                    argsRequire: true,
                    role: "everyone",
                    execute(message, args) {
                        // commande a exécuté
                    }
                }
        }
}