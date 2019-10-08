const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SyncUser = new Schema({
    username: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('SyncUser', SyncUser);