const mongoose = require('mongoose')


const errorSchema = mongoose.Schema({
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    wareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses'
    },
    quantity: Number,
    reason: String,
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {timestamps: true})

module.exports = mongoose.model('stock_errors', errorSchema)