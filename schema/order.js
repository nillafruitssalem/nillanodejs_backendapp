
var mongoose = require('mongoose');

var orderschema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },

    orderid: {
        type: String,
        required: true
    },
    productid: {
        type: String
    },
    orderhistory: {
        type: Boolean,
        required: true
    },
    orderproductname: {
        type: String
    },
    orderproductrate: mongoose.Decimal128,
    orderproductqty: {
        type: Number
    },
    orderproductunits: {
        type: String
    },
    orderproductimage: {
        type: String
    },
    orderconform: {
        type: Boolean,
        required: true
    },
    orderedon: {
        type: String,
        required: true,
        // default: Date.now()
    },
    orderedconformdate: {
        type: String,
        // required: true,
        // default: Date.now()
    }

})
module.exports = mongoose.model('orders', orderschema);