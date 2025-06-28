const Stock_Error = require('../model/Stock_Error')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')

const errorController = {

    listStockImport: async (req, res) => {
        try {
            const admin = req.userId
            const imports = await Stock_Import.find({ adminId: admin }).populate('wareId').populate('items.proId')
            const result = []
            for (const imp of imports) {
                for (const item of imp.items) {
                    result.push({
                        wareId: imp.wareId._id,
                        wareName: imp.wareId.name,
                        proId: item.proId._id,
                        proName: item.proId.name,
                        proQuantity: item.quantity
                    })
                }
            }
            return res.status(200).json({ data: result })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    },

    declareErrorStock: async (req, res) => {
        try {
            const admin = req.userId
            const {wareId, proId, quantity, reason } = req.body
            if (!wareId || !proId || !quantity || !reason) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường' })
            }

            if (quantity <= 0) {
                return res.status(400).json({ message: 'Số lượng khai báo không được phép nhỏ hơn hoặc bằng 0' })
            }

            const checkProductExist = await Stock_Error.findOne({proId, wareId})
            if(checkProductExist){
                return res.status(400).json({message: 'Sản phẩm đã được khai báo lỗi trong kho'})
            }

            const imports = await Stock_Import.find({ adminId: admin, wareId: wareId, 'items.proId': proId }).populate('wareId').populate('items.proId')
            
            let totalInStock = 0
            for(const imp of imports){
                for(item of imp.items){
                    if(item.proId._id.toString() === proId){
                        totalInStock += item.quantity
                    }
                }
            }

            if(quantity >= totalInStock){
                return res.status(400).json({message: `Số lượng khai báo ${quantity} đang lớn hơn số lượng còn lại trong kho ${totalInStock}`})
            }

            const newDeclareError = new Stock_Error({
                proId,
                wareId,
                quantity,
                reason,
                adminId: admin
            })
            await newDeclareError.save()

            return res.status(201).json({ data: newDeclareError })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    },

    listStockError: async (req, res) => {
        try {
            const userId = req.userId
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({message: 'Không tìm thấy người dùng'})
            }

            let listError

            // Vai trò Admin
            if(!user.adminId){
                const usersWithSameAdmin = await User.find({ adminId: user._id }, '_id')
                const userIds = usersWithSameAdmin.map(u => u._id)
                listError = await Stock_Error.find({
                    adminId: { $in: userIds }
                }).populate('proId').populate('wareId')
            }else{
                // Vai trò nhân viên
                listError = await Stock_Error.find({adminId: userId}).populate('proId').populate('wareId')
            }
            return res.status(200).json({data: listError})
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

}


module.exports = errorController