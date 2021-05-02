'use strict';
//app depandancies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//app setup
const server = express();
server.use(cors());
server.use(express.static('public'));
server.set('view engine', 'ejs');
const PORT = process.env.PORT || 4500
server.use(express.urlencoded({ extended: true }));
///root
server.get('/home', mainHandler);
server.get('/searches/show', showHandler);
server.get('/searches', searchesHandler);
server.get('*', errorHandler);
///callback funcation
function mainHandler(req,res) {
    res.render('pages/index');
}
function showHandler(req, res) {
    res.render('pages/searches/show');
}
function searchesHandler(req, res) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=search+terms`
    superagent.get(url)
        .then(data => {
            let bData = data.body;
            // console.log(bData);
            let arr = bData.items.map(e => new Book(e));
            // console.log(arr);
            res.render('pages/searches/show',{bArr:arr});
            
        })
        .catch(error => {
            console.log(error);
            res.send(error);
    })
    
}
function errorHandler(req, res) {
    res.status(500).render('pages/error');
}
//////////constracter
function Book(obj) {
    this.urlPhoto = obj.volumeInfo.imageLinks;
    this.title = obj.volumeInfo.title;
    this.author = obj.volumeInfo.authors;
    this.description = obj.volumeInfo.description;
}
//port listen
server.listen(PORT, () => {
    console.log(`listen to PORT ${PORT}`)
})