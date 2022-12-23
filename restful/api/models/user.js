const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String, 
        required: true, 
        unique: true,
        match: /^\w+([\.\-!#$%&'*+\-\/=?^_`{|}~]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {type: String, required: true}
})

module.exports = mongoose.model('User', userSchema);