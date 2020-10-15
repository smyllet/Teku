// Node Modules
const https = require("https")
const fs = require('fs')

// Import express app
const app = require("./expressapp")

// Options Serveur https
const httpsPort = 3000
app.set('port', httpsPort)
const sslOption = {key: fs.readFileSync('ssl/key.pem'), cert: fs.readFileSync('ssl/cert.pem'), passphrase: fs.readFileSync('ssl/passphrase.pem').toString()}

// Création serveur https
const server = https.createServer(sslOption, app)
server.listen(httpsPort);

// Event serveur web
server.on("listening", () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log("Serveur prêt et à l'écoute sur le port : " + bind)
})
