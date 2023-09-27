//  модел на базата данна

const mongoose = require ("mongoose");

const UserSchema = new mongoose.Schema({
    chatId: {
        type: String
    },
    wrong: {
        type: Number,
        defaultValue: 0
    },
        right: {
        type: Number,
        defaultValue: 0
    },
})

const User = mongoose.model('User', UserSchema);

module.exports = User;