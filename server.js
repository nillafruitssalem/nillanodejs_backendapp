const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
const dotent = require('dotenv')
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const userschema = require("./schema/user.js")
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const upload = require('./multerconfig');
dotent.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

mongoose.Promise = global.Promise;
mongoose.connection.on('connected', function () {
    console.log('Connection to Mongo established.');
    if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
        mongoose.connection.db = mongoose.connection.client.db(process.env.DBNAME);
    }
});
mongoose.connect(process.env.MONGODBURL, { dbName: process.env.DBNAME, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).catch(err => {
    if (err) {

        console.log("TEST", err)
        return err;
    }
})
// connection/intiate status
app.get("/", (req, res) => {
    res.json("Connected");
    res.end();
});
// register user
app.post("/reguser", (req, res) => {
    console.log(req.body);
    user = new userschema({
        userid: (req.body.username).substring(0, 3) + Date.now(),
        username: req.body.username,
        password: req.body.password,
        emailid: req.body.emailid,
        address: req.body.address,
        phonenumber: req.body.phonenumber,
    })
    user.save().then(result => {
        res.json({ "status": true, "msg": "Record Insertion Success" });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "msg": "Record Insertion UnSuccess", "Error": e });
        res.end();
    })
})
// find specific user
app.get("/finduser/:userid", (req, res) => {
    console.log(req.body);
    userschema.findOne({userid:req.params.userid}).then(result =>{
        res.json({ "status": true, "Data":result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false,"Error": e });
        res.end();
    })
})
// show all users
app.get("/finduser", (req, res) => {
    console.log(req.body);
    userschema.find({}).then(result =>{
        res.json({ "status": true, "Data":result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false,"Error": e });
        res.end();
    })
})
var port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (!err) {
        console.log("Port is Listening on " + port);
    }
    return err;

})