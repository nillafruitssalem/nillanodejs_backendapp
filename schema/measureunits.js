
var mongoose = require('mongoose');

var units = new mongoose.Schema({
    unitsid: {
        type: String,
        required: true,
        unique: true
    },
    units: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    createdon: {
        type: String,
        default: Date.now()
    },

})
module.exports = mongoose.model('units', units);