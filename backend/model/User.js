const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
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
        required: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    status: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: {
        type: String
    },
    resetPasswordOtpExpire: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model('users', userSchema)