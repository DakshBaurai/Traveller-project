const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;
//passport uses pdkdf hashing algo

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
    //we didn't define username and password as mongoose do it by default
});

//it does automatic username, hashing salting and haspassword also includdes important method for authentication etc
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);