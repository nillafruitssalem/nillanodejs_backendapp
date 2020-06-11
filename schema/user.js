
var mongoose = require('mongoose');

var user = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        trim:true,
        required: true,
        unique: true
    },
    emailid: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String
    },
    phonenumber: {
        type: String,
        required: true,
        unique: true,
        maxlength: 10
    },
    userrole:{
        type:String,
        required:true,
        trim:true,
        default:user
    },
    createdon: {
        type: String,
        default: Date.now()
    },

})
module.exports = mongoose.model('user', user);