const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Tên danh mục phải có ít nhất 3 ký tự'],
        maxlength: [255, 'Tên danh mục không được vượt quá 255 ký tự'],
        trim: true
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

module.exports = mongoose.model('categories', categorySchema)