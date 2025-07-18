const mongoose = require('mongoose')


const errorSchema = mongoose.Schema({
    importId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock_imports'
    },
    wareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses'
    },
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    quantity: Number,
    reason: String,
    declareDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model('stock_errors', errorSchema)