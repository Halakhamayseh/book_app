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
const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.urlencoded({ extended: true }));
///root
server.get('/', mainHandler);
server.get('/searches/new', newHandler);
server.get('/books/:id', idBookHandler);
server.post('/books', BookHandler);
server.post('/searches', searchesHandler);
server.get('*', errorHandler);
///callback funcation
function mainHandler(req, res) {
    // console.log('hi');
    let SQL = `SELECT * FROM Book;`;
    client.query(SQL)
        .then(result => {
            // console.log(result)
            res.render('pages/index',{bookKey: result.rows});
})
}
function newHandler(req, res) {
    res.render('pages/searches/new');
}
function idBookHandler(req, res) {
    let SQL = `SELECT * FROM Book WHERE id=$1;`;
    let safeValue = [req.params.id]
    client.query(SQL, safeValue)
        .then(result => {
            // console.log(result.rows[0]);
            res.render('pages/books/show', { objectId: result.rows[0] });
        });
    
    
}

function BookHandler(req, res) {
    // console.log(req.body);
    let { image_url, title, author, description } = req.body;
    let SQL = `INSERT INTO Book (image_url,title,author,description) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let safeVaules = [image_url, title, author, description]
    console.log(safeVaules);
    client.query(SQL, safeVaules)
        .then(result => {
            // console.log(result.rows)
            res.redirect(`/books/${result.rows[0].id}`)
        });
}
function searchesHandler(req, res) {
    let q = req.body.radio;
    let search = req.body.value;
    console.log(q,search);
    let url = `https://www.googleapis.com/books/v1/volumes?q=+${q}:${search}`
    superagent.get(url)
        .then(data => {
            let bData = data.body;
            // console.log(bData);
            let arr = bData.items.map(e => new Book(e));
            console.log(arr);
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
    this.image_url = urlPhoto1 || urlPhoto2 || urlPhoto3;
    this.title = obj.volumeInfo.title || 'not found';
    this.author = obj.volumeInfo.authors ||'not found' ;
    this.description = obj.volumeInfo.description ||'not found';
    // this.isbn = obj.volumeInfo.industryIdentifiers.type;
    // this.bookshelf = obj.volumeInfo.categories[0];
}
//port listen
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`listen to PORT ${PORT}`)
        })
})
