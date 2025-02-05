//schema that will be used to set up users in mongoDB when registering new people
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    email:{type:String, required:true}
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;