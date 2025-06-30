const Warehouse = require('../model/Warehouse')
const Product = require('../model/Product')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')
const Role = require('../model/Role')


const importController = {

    listWarehouse: async(req, res) => {
        try {
            const staffId = req.userId
            const warehouse = await Warehouse.find({staffId: staffId, isActive: true, isDelete: false})
            if(!warehouse){
                return res.status(404).json({message: 'Nhân viên chưa được gán kho'})
            }
            return res.status(200).json({data: warehouse})
        } catch (error) {
            return res.status(500).json(error)
        }
    },

    listProduct: async(req, res) => {
        try {
            // const userId = req.userId
            // const user = await User.findById(userId)
            // if(!user){
            //     return res.status(404).json({message: 'Không tìm thấy người dùng'})
            // }

            // const adminId = user.adminId
            // if(!adminId){
            //     return res.status(404).json({message: 'Người dùng không có admin quản lý'})
            // }

            // const usersWithSameAdmin = await User.find({adminId: adminId}, '_id')
            // const userIds = usersWithSameAdmin.map(u => u._id)

            // const products = await Product.find({adminId: {$in: userIds}, isDelete: false}).populate('adminId')
            // return res.status(200).json({data: products})

            const userId = req.userId
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({message: 'Không tìm thấy người dùng'})
            }

            const admin = user.adminId
            if(!admin){
                return res.status(404).json({message: 'Người dùng không có admin quản lý'})
            }

            const products = await Product.find({adminId: admin, isDelete: false})
            return res.status(200).json({data: products})
        } catch (error) {
            return res.status(500).json(error)
        }
    },

    importIntoWarehouse: async(req, res) => {
        try {
            const adminId = req.userId
            const {receiptCode, receiptName, wareId, items} = req.body

            if(!receiptCode || !receiptName || !wareId || !items){
                return res.status(400).json({message: 'Vui lòng nhập đầy đủ các trường'})
            }
            

            const checkCodeIsExist = await Stock_Import.findOne({receiptCode})
            if(checkCodeIsExist){
                return res.status(400).json({ message: 'Mã phiếu đã tồn tại trong hệ thống' })
            }

            const warehouse = await Warehouse.findById(wareId)
            if(!warehouse){
                return res.status(404).json({message: 'Kho không tồn tại trong hệ thống'})
            }

            const itemResults = []
            for(const item of items){
                const {proId, quantity} = item

                if(!proId || !quantity){
                    return res.status(400).json({message: 'Vui lòng nhập đầy đủ các trường'})
                }

                const product = await Product.findById(proId)
                if(!product){
                    return res.status(404).json({message: `Sản phẩm ${product.name} không tồn tại`})
                }
                if(quantity <= 0){
                    return res.status(400).json({message: `Số lượng sản phẩm ${product.name} không được bé hơn hoặc bằng 0`})
                }
                const unitPrice = product.price * quantity
                
                itemResults.push({
                    proId,
                    quantity,
                    unitPrice
                })
            }

            const addNewImport = new Stock_Import({
                receiptCode,
                receiptName,
                wareId,
                adminId: adminId,
                items: itemResults
            })

            await addNewImport.save()
            return res.status(201).json({data: addNewImport})

        } catch (error) {
            return res.status(500).json(error)
        }
    },

    historyImport: async (req, res) => {
        try {
            const userId = req.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            let imports;

            // Vai trò admin
            if (!user.adminId) {
                const usersWithSameAdmin = await User.find({ adminId: user._id }, '_id');
                const userIds = usersWithSameAdmin.map(u => u._id);

                imports = await Stock_Import.find({
                    adminId: { $in: userIds }
                }).populate('wareId').populate('adminId').populate('items.proId');

            } else {
                // Vai trò nhân viên
                imports = await Stock_Import.find({
                    adminId: userId
                }).populate('wareId').populate('adminId').populate('items.proId');
            }

            return res.status(200).json({ data: imports });

        } catch (error) {
            return res.status(500).json(error);
        }
    }


}

module.exports = importController