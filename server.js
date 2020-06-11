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
const jwt = require("jsonwebtoken");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const mongoose = require("mongoose");
const userschema = require("./schema/user.js")
const productschema = require("./schema/product.js")
const measureschema = require("./schema/measureunits.js")
const orderschema = require("./schema/order.js")
app.use(bodyparser.json({limit: '50mb', extended: true}))
app.use(bodyparser.urlencoded({limit: '50mb', extended: true}))
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set('setsecret', process.env.SECRETECODE)

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
// login
app.post("/login", (req, res) => {
    jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data: req.body.emailid }, app.get('setsecret'), (e, d) => {
        // jwt.sign(req.body.name,app.get('setsecret'),{expiresIn: Math.floor(Date.now() / 1000) + (60 * 1) },(e,d)=>{   
        if (e) {
            res.json({ "status": false, "Error": e });
            res.end();
        }
        if (d) {
            userschema.findOne({ "emailid": req.body.emailid, "password": req.body.password }).then(result => {
                if (result == null) {
                    res.json({ "status": false, "msg":"Your Are Not A User / Check your Credencials" });
                    res.end();
                } else {
                    res.json({ "status": true, "Data": result, "token": d });
                    res.end();
                }
            }).catch(e => {
                // console.log(e)
                res.json({ "status": false, "Error": e });
                res.end();
            })
        }
    })

})

// jwt auth
app.use((req, res, next) => {
    var token = req.headers['access-token']
    if (token) {
        jwt.verify(token, app.get('setsecret'), (err, data) => {
            if (err) {
                res.json({ status: false, msg: "invalid token", Error: err });
                res.end();
            } else {
                next();
            }
        })
    } else {
        res.json({ status: false, msg: 'no token provided' });
        res.end();
    }
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
app.post("/addproduct", upload.single('file'), (req, res) => {
    let myarray = [];
    myarray.push(JSON.parse(req.body.pdata));
    if (!req.file) {
        res.status(500);
        res.json('file not found');
        res.end();
        return;
    }
    cloudinary.uploader.upload(req.file.path, (err, data) => {
        if (err) {
            console.log("err on cloudinary", err)
            res.end();
            return;
        }
        if (data) {
            prod = new productschema({
                productid: (myarray[0].productname).substring(0, 3) + Date.now(),
                productname: myarray[0].productname,
                productrate: myarray[0].productrate,
                productqty: myarray[0].productqty,
                productunits: myarray[0].productunits,
                productimage: data["secure_url"],
                productimgdet: data
            })
            prod.save().then(result => {
                res.json({ "status": true, "msg": "Record Insertion Success" });
                res.end();
            }).catch(e => {
                console.log(e)
                res.json({ "status": false, "msg": "Record Insertion UnSuccess", "Error": e });
                res.end();
                return;
            })
        }
    })

})

// update Product
app.put("/updateproduct/:pid", upload.single('file'), (req, res) => {
    let myarray = [];
    myarray.push(JSON.parse(req.body.pdata));
    console.log("updateproduct", JSON.parse(req.body.pdata))
    if (!req.file) {
        productschema.findOneAndUpdate(
            { "productid": req.params.pid },
            {
                "productname": myarray[0].productname,
                "productrate": myarray[0].productrate,
                "productqty": myarray[0].productqty,
                "productunits": myarray[0].productunits
            }).then(result => {
                res.json({ "status": true, "msg": "Record Updated Success" });
                res.end();
            }).catch(e => {
                console.log(e)
                res.json({ "status": false, "msg": "Record Updated UnSuccess", "Error": e });
                res.end();
            })
    }
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, (err, data) => {
            if (err) {
                res.json({ "status": false, "msg": "Error on Cloudinary" });
                res.end();
            }
            if (data) {
                productschema.findOneAndUpdate(
                    { "productid": req.params.pid },
                    {
                        "productname": myarray[0].productname,
                        "productrate": myarray[0].productrate,
                        "productqty": myarray[0].productqty,
                        "productunits": myarray[0].productunits,
                        "productimage": data["secure_url"],
                        "productimgdet": data
                    }).then(result => {
                        res.json({ "status": true, "msg": "Record Updated Success" });
                        res.end();
                    }).catch(e => {
                        console.log(e)
                        res.json({ "status": false, "msg": "Record Updated UnSuccess", "Error": e });
                        res.end();
                    })
            }
        })
    }
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
    // console.log(req.body)
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
                            orderid: (req.body.userid).substring(0, 6) + Date.now(),
                            productid: req.params.pid,
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
    orderschema.find({ "userid": req.params.userid, "orderhistory": false })
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
    orderschema.find({ "userid": req.params.userid, "orderhistory": true })
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
// cancel order
app.post("/cancelorder/:pid", (req, res) => {
    orderschema.findOne({ "userid": req.body.userid, "productid": req.params.pid }).then(result => {
        // console.log(result)
        if (result == null) {
            res.json({ "status": false, "msg": "You dont have this product" });
            res.end();
            return;
        } else {
            productschema.findOne({ "productid": req.params.pid }).then(result => {
                console.log("reuslt order", result)
                if (result.productqty == 0) {
                    res.json({ "status": false, "msg": "out of stock please update product quatity" });
                    res.end();
                }
                else {
                    if (result.productqty >= req.body.orderqty) {
                        totalqty = 0;
                        totalqty = result.productqty + req.body.orderqty
                        console.log(totalqty)

                        productschema.findOneAndUpdate(
                            { "productid": result.productid },
                            { "productqty": totalqty })
                            .then(result => {
                                console.log(result)
                                orderschema.findOneAndDelete({ "userid": req.body.userid, "productid": req.params.pid }).then(result => {
                                    res.json({ "status": true, "msg": "Order cancelled  Success" });
                                    res.end();
                                }).catch(e => {
                                    res.json({ "status": false, "msg": "Error on cancel order", "Error": e });
                                    res.end();
                                })
                            }).catch(e => {
                                console.log(e)
                                res.json({ "status": false, "msg": "Error on cancel order", "Error": e });
                                res.end();
                            })
                    }
                    if (result.productqty < req.body.orderqty) {
                        res.json({ "status": false, "msg": "sorry we dont have higher quatity" });
                        res.end();
                    }
                }
            })
        }
    }).catch(e => {
        res.json({ "status": false, "msg": "Error on cancel order", "Error": e });
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
// add measure units
app.post("/addmeasure", (req, res) => {
    units = new measureschema({
        unitsid: (req.body.units).substring(0, 2) + Date.now(),
        units: req.body.units
    })
    units.save().then(result => {
        res.json({ "status": true, "msg": "Record Insertion Success" });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "msg": "Record Insertion UnSuccess", "Error": e });
        res.end();
    })
})
// all measure units
app.get("/allmeasure", (req, res) => {
    measureschema.find({}).then(result => {
        res.json({ "status": true, "Data": result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "Error": e });
        res.end();
    })
})

// delete measure units
app.delete("/deletemeasure/:unitsid", (req, res) => {
    measureschema.findOneAndDelete(
        { "unitsid": req.params.unitsid }).then(result => {
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

var port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (!err) {
        console.log("Port is Listening on " + port);
    }
    return err;

})