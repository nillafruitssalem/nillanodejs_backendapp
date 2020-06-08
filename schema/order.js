
var mongoose = require('mongoose');

var orderdetails = new mongoose.Schema({
    userid: {
        type: String,
        required: true        
    },
    orderid: {
        type: String,
        required: true        
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

    orderedon: {
        type: String,
        default: Date.now()
    },

})
module.exports = mongoose.model('orderdetails', orderdetails);