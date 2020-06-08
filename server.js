require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
// var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
// import $ from "jquery";
// var $ = require( "jquery" );
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const mongoose = require("mongoose");
const userschema = require("./schema/user.js")
const productschema = require("./schema/product.js")
const orderschema = require("./schema/order.js")
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const upload = require('./multerconfig');

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
app.get("/allusers/:userid", (req, res) => {
    userschema.findOne({ userid: req.params.userid }).then(result => {
        res.json({ "status": true, "Data": result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "Error": e });
        res.end();
    })
})
// show all users
app.get("/allusers", (req, res) => {
    userschema.find({}).then(result => {
        res.json({ "status": true, "Data": result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "Error": e });
        res.end();
    })
})

//  show all products
app.get("/allproduct", (req, res) => {
    productschema.find({}).then(result => {
        res.json({ "status": true, "Data": result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "Error": e });
        res.end();
    })
})

// add Product
app.post("/addproduct", (req, res) => {
    prod = new productschema({
        productid: (req.body.productname).substring(0, 3) + Date.now(),
        productname: req.body.productname,
        productrate: req.body.productrate,
        productqty: req.body.productqty,
        productimage: req.body.productimage
    })
    prod.save().then(result => {
        res.json({ "status": true, "msg": "Record Insertion Success" });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "msg": "Record Insertion UnSuccess", "Error": e });
        res.end();
    })
})

// update Product
app.put("/updateproduct/:pid", (req, res) => {
    productschema.findOneAndUpdate(
        { "productid": req.params.pid },
        {
            "productname": req.body.productname,
            "productrate": req.body.productrate,
            "productqty": req.body.productqty,
            // "prductimage": (myarray[0].pname).substring(0, 3) + req.file.originalname
        }).then(result => {
            res.json({ "status": true, "msg": "Record Updated Success" });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "msg": "Record Updated UnSuccess", "Error": e });
            res.end();
        })
})

// delete Product
app.delete("/deleteproduct/:pid", (req, res) => {
    productschema.findOneAndDelete(
        { "productid": req.params.pid }).then(result => {
            if (result == null) {
                res.json({ "status": true, "msg": "No Record found" });
                res.end();
            }
            res.json({ "status": true, "msg": "Record Deletion Success" });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "msg": "Record Deletion UnSuccess", "Error": e });
            res.end();
        })
})

// specific  Product
app.get("/allproduct/:pid", (req, res) => {
    productschema.findOne({ "productid": req.params.pid })
        .then(result => {
            if (result == null) {
                res.json({ "status": true, "msg": "No Record found" });
                res.end();
            }
            res.json({ "status": true, "Data": result });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "msg": "No Record from all products ", "Error": e });
            res.end();
        })
})

// add order
app.post("/addorder/:pid", (req, res) => {
    console.log(req.body)
    productschema.findOne({ "productid": req.params.pid }).then(result => {
        console.log("reuslt order", result)
        if (result.productqty == 0) {
            res.json({ "status": false, "msg": "out of stock please update product quatity" });
            res.end();
        }
        else {
            if (result.productqty >= req.body.orderqty) {
                totalqty = 0;
                totalqty = result.productqty - req.body.orderqty
                console.log(totalqty)

                productschema.findOneAndUpdate(
                    { "productid": result.productid },
                    { "productqty": totalqty })
                    .then(result => {
                        console.log(result)

                        order = new orderschema({
                            userid: req.body.userid,
                            orderid:(req.body.userid).substring(0,6) + Date.now(),
                            orderhistory: req.body.orderhistory,
                            orderproductname: result.productname,
                            orderproductrate: result.productrate,
                            orderproductqty: req.body.orderqty,
                            orderproductimage: result.productimage
                        })
                        order.save().then(result => {
                            res.json({ "status": true, "msg": "Order added  Success" });
                            res.end();
                        }).catch(e => {
                            console.log(e)
                            res.json({ "status": false, "msg": "Unable to add the Order UnSuccess", "Error": e });
                            res.end();
                        })


                    }).catch(e => {
                        console.log(e)
                        res.json({ "status": false, "msg": "Error on add order", "Error": e });
                        res.end();
                    })
            }
            if (result.productqty < req.body.orderqty) {
                res.json({ "status": false, "msg": "sorry we dont have higher quatity" });
                res.end();
            }
        }
    })
})
// specified user oder
app.get("/orderdetails/:userid", (req, res) => {
    orderschema.find({ "userid": req.params.userid ,"orderhistory":false})
        .then(result => {
            if (result == null) {
                res.json({ "status": true, "msg": "No Record found" });
                res.end();
            }
            res.json({ "status": true, "Data": result });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "msg": "No Record from all products ", "Error": e });
            res.end();
        })
})
app.get("/orderhistory/:userid", (req, res) => {
    orderschema.find({ "userid": req.params.userid ,"orderhistory":true})
        .then(result => {
            if (result == null) {
                res.json({ "status": true, "msg": "No Record found" });
                res.end();
            }
            res.json({ "status": true, "Data": result });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "msg": "No Record from all products ", "Error": e });
            res.end();
        })
})
app.post("/sendmail", (req, res) => {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAILID,
            pass: process.env.GMAILPASSWORD
        }
    });

    let mailOptions = {
        from: 'nillafruitssalem@gmail.com',
        to: 'nillafruitssalem@gmail.com',
        subject: 'Testing and Testing',
        text: 'Hi it',
        // attachments: [
        //     { filename: 'globe.jpeg', path: './globe.jpeg' }
        // ],    
        html: '<!DOCTYPE html>' +
            '<html><head><title>Appointment</title>' +
            '</head><body id="tbody"><div>' +
            '<img src="http://evokebeautysalon1.herokuapp.com/main/img/logo.png" alt="" width="160">' +
            '<p>Thank you for your appointment.</p>' +
            '<p>Here is summery:</p>' +
            '<p>Name: James Falcon</p>' +
            '<p>Date: Feb 2, 2017</p>' +
            '<p>Package: Hair Cut </p>' +
            '<p>Arrival time: 4:30 PM</p>' +
            '</div></body></html>'
        // html:'<div class="container"> <table class="table"> <thead> <tr> <th>Firstname</th><th>Lastname</th> <th>Email</th></tr></thead><tbody id="tbody"></tbody></table></div>'    

    };

    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log(err);
        }
        if (result) {
            console.log("Email send", result)
        }
    })
})

var port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (!err) {
        console.log("Port is Listening on " + port);
    }
    return err;

})