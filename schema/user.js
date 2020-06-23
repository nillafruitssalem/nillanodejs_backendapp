
var mongoose = require('mongoose');

var userschema = new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
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
    location:{
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
        default:"user"
    },
    createdon: {
        type: String,
        default: Date.now()
    },

})
module.exports = mongoose.model('users', userschema);