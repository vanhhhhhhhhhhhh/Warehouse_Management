const mongoose = require('mongoose')

const stockInventorySchema = mongoose.Schema({
    wareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses',
        required: true
    },
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    totalImport: {
        type: Number,
        default: 0
    },
    totalExport: {
        type: Number,
        default: 0
    },
    totalError: {
        type: Number,
        default: 0
    },
    currentStock: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Tạo compound index để đảm bảo mỗi sản phẩm chỉ có một bản ghi tồn kho trong mỗi kho của mỗi admin
stockInventorySchema.index({ wareId: 1, proId: 1, adminId: 1 }, { unique: true })

module.exports = mongoose.model('stock_inventories', stockInventorySchema)