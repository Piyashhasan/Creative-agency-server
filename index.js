const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wbj4f.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('reviews'));
app.use(fileUpload());

const port = 5000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderListCollection = client.db("creativeAgency").collection("orderList");
    const reviewCollection = client.db("creativeAgency").collection("review");
    
    
    app.post('/addOrder', (req, res) => { 
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const service = req.body.service;
        const details = req.body.details;
        const number = req.body.number;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderListCollection.insertOne({ name, email, service, details, number ,image })
            .then(result => {
                res.send(result.insertedCount);
        })  
    })
        
    app.get('/collectOrderInfo', (req, res) => {
        orderListCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addReview', (req, res) => {
        const reviewInfo = req.body;
        console.log(reviewInfo);
        reviewCollection.insertOne(reviewInfo)
        .then(result => {
            res.send(result);
        })
    });
    app.get('/collectReviewInfo', (req, res) => {
        reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
            
        })
    })
    console.log("data base connected");
    
    
});

app.listen(process.env.PORT || 5000);