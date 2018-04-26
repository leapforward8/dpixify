var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = new mongoose.Schema({
    _id: Number,
    username: String,
    password: String,
    accessToken: String,
    refreshToken: String,
    profile: Object
});

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);
