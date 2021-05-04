'use strict';
//app depandancies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
//app setup
const server = express();
server.use(cors());
server.use(express.static('public'));
server.set('view engine', 'ejs');
const PORT = process.env.PORT || 4500
const client = new pg.Client(process.env.DATA_URL);
server.use(express.urlencoded({ extended: true }));
///root
server.get('/', mainHandler);
server.get('/searches/new', newHandler);
server.post('/searches', searchesHandler);
server.get('*', errorHandler);
///callback funcation
function mainHandler(req, res) {
    console.log('hi');
    let SQL = `SELECT * FROM Book`;
    client.query(SQL)
        .then(result => {
            console.log(result)
            res.render('pages/index',{bookKey:result.rows});
    })
    
}
function newHandler(req, res) {
    res.render('pages/searches/new');
}
function searchesHandler(req, res) {
    let q = req.body.radio;
    let search = req.body.value;
    console.log(q,search);
    let url = `https://www.googleapis.com/books/v1/volumes?q=search+${q}:${search}&maxResults=10`//
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
    let urlPhoto1 = obj.volumeInfo.imageLinks.smallThumbnail;
    let urlPhoto2 = obj.volumeInfo.imageLinks.thumbnail;
    let urlPhoto3 = `https://i.imgur.com/J5LVHEL.jpg`;
    this.urlPhoto = urlPhoto1 || urlPhoto2 || urlPhoto3;
    this.title = obj.volumeInfo.title;
    this.author = obj.volumeInfo.authors;
    this.description = obj.volumeInfo.description;
}
//port listen
server.listen(PORT, () => {
    console.log(`listen to PORT ${PORT}`)
})