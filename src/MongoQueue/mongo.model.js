const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let NodeSchema = new Schema({
    value: String,
    previous: {
        type: Schema.Types.ObjectId,
        default: null
    },
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
    },
    next: {
        type: Schema.Types.ObjectId,
        default: null
    },
    isHead: {
        type: Boolean,
        default: true
    },
    isTail: {
        type: Boolean,
        default: false
    }
});

module.exports = NodeSchema;