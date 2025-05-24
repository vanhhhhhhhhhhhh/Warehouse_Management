const mongoose = require('mongoose')


const exportSchema = mongoose.Schema({
    wareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    exportDate: {
        type: Date,
        default: Date.now
    },
    items: [
        {
            proId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            quantity: Number,
            unitPrice: Number
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('stock_exports', exportSchema)