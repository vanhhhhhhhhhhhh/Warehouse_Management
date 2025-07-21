const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        minlength: [3, 'Mã sản phẩm phải có ít nhất 3 ký tự'],
        maxlength: [255, 'Mã sản phẩm không được vượt quá 255 ký tự'],
        trim: true
    },
    name: {
        type: String,
        required: true,
        minlength: [3, 'Tên sản phẩm phải có ít nhất 3 ký tự'],
        maxlength: [255, 'Tên sản phẩm không được vượt quá 255 ký tự'],
        trim: true
    },
    cateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    image: String,
    description: {
        type: String,
        maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự'],
        trim: true
    },
    price: {
        type: Number,
        min: 0
    },
    attribute: [
        {
            name: {
                type: String,
                trim: true,
                maxlength: [255, 'Tên thuộc tính không được vượt quá 255 ký tự'],
                required: true
            },
            value: {
                type: String,
                trim: true,
                maxlength: [255, 'Giá trị thuộc tính không được vượt quá 255 ký tự'],
                required: true
            }
        }
    ],
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