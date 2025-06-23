const Warehouse = require('../model/Warehouse')
const Product = require('../model/Product')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')
const Role = require('../model/Role')


const importController = {

    listWarehouse: async (req, res) => {
        try {
            const userId = req.userId
            const warehouse = await Warehouse.find({staffId: userId, isDelete: false})
            return res.status(200).json({data: warehouse})
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

}

module.exports = importController