
var mongoose = require('mongoose');

var product = new mongoose.Schema({
    productid: {
        type: String,
        required: true,
        unique: true
    },
    productname: {
        type: String,
        trim: true,
        unique: true
    },
    productrate:mongoose.Decimal128,
    productqty: {
        type: Number,
        required: true        
    },
    productunits:{
        type: String,
        // unique: true
        trim: true,
    },
    productimage: {
        type: String
    },
    
    createdon: {
        type: String,
        default: Date.now()
    },

})
module.exports = mongoose.model('product', product);