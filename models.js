import mongoose from "mongoose";


const CountSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    wins: {
        type: Number,
    },
    loose: {
        type: Number,
    }
})

const Cunt = mongoose.model('Animal', CountSchema);

module.exports = Cunt;