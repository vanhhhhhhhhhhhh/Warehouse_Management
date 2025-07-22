const mongoose = require('mongoose')


const importSchema = mongoose.Schema({
    receiptCode: {
        type: String,
        required: true
    },
    receiptName: {
        type: String,
        required: true
    },
    wareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    importDate: {
        type: Date,
        default: Date.now
    },
    items: [
        {
            proId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ]
}, {timestamps: true})

// Drop old index and create new compound index
importSchema.pre('save', async function(next) {
    try {
        const model = mongoose.model('stock_imports', importSchema);
        await model.collection.dropIndex('receiptCode_1');
    } catch (error) {
        // Index might not exist, ignore error
    }
    next();
});

// Create compound index
importSchema.index({ receiptCode: 1, adminId: 1 }, { unique: true });

const Stock_Import = mongoose.model('stock_imports', importSchema);

// Ensure indexes are created
Stock_Import.createIndexes().catch(console.error);

module.exports = Stock_Import;