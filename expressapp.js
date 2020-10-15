// Node Modules
const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')

// Initialisation de express
const app = express();

// Configuration de express
app.use(express.json())
app.use(bodyparser.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, 'public'))) // Dossier accessible en public

// Configuration de EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Import et ajout des routes
app.use('/', require('./routes/index'))

// Traitement des erreurs 404
app.use((req, res, next) => {
    res.status(404).render('404',{title: '404 : Page introuvable', error:'La page que vous demandez est indisponible', url: req.url})
})

// Traitement des erreurs
app.use((err, req, res, next) => {
    console.error(err)
});

// Export de express
module.exports = app;
