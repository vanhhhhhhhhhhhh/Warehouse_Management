const mongoose = require('mongoose')


const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    permissions: {
        type: Map,
        of: [String],
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('roles', roleSchema)