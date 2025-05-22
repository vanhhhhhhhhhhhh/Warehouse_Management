const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('users', userSchema)