const mongoose = require('mongoose')

const warehouseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    phone: String,
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    staffId: {
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

module.exports = mongoose.model('warehouses', warehouseSchema)