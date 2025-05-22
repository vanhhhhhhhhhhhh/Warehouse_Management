const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    image: String,
    description: String,
    price: {
        type: Number,
        min: 0
    },
    attribute: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('products', productSchema)