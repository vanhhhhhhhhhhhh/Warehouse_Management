
const Export = require('../model/Stock_Export')
const Product = require('../model/Product') 
const Warehouse = require('../model/Warehouse')
const User = require('../model/User')
const inventoryController = require('./inventoryController')

exports.createExport = async (req, res) => {
  try {
    const userId = req.userId;

    const { receiptCode, receiptName, wareId, items } = req.body

    // Validate input
    if (!receiptCode || !receiptName || !wareId || !items || !items.length) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
    }

    // Lấy adminId từ thông tin user trong request
    const actualAdminId = req.user.adminId || req.userId

    // Kiểm tra số lượng tồn kho trước khi xuất
    for (const item of items) {
      const { proId, quantity } = item
      if (!proId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' })
      }
    }

    const newExport = new Export({
      receiptCode,
      receiptName,
      wareId,
      adminId: userId,
      items
    })

    await newExport.save()

    // Cập nhật số lượng tồn kho cho từng sản phẩm
    for (const item of items) {
      const { proId, quantity } = item
      await inventoryController.updateStockOut(wareId, proId, quantity, actualAdminId)
    }

    return res.status(201).json({
      message: 'Tạo phiếu xuất kho thành công',
      data: newExport
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi khi tạo phiếu xuất' })
  }
}
exports.listWarehouse= async(req, res) => {
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
exports.exportReceipt= async (req, res) => {
    try {
        const expId = req.params.id
        const stockExport = await Export.findById(expId)
            .populate('wareId')
            .populate('adminId')
            .populate('items.proId')

        if (!stockExport) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu' })
        }

        return res.status(200).json({ data: stockExport })
    } catch (error) {
        console.error('Lỗi lấy phiếu xuất:', error)
        return res.status(500).json({ message: 'Lỗi server', error })
    }
}

exports.getExportHistory = async (req, res) => {
  try {
    const exports = await Export.find()
      .populate('wareId', 'name')
      .populate('adminId', 'fullName')
      .populate('items.proId', 'name price')

    return res.status(200).json({
      data: exports
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử xuất kho' })
  }
}
exports.deleteExport = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Export.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu xuất' })
    }

    return res.status(200).json({ message: 'Xóa phiếu xuất thành công' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi khi xóa phiếu xuất' })
  }
}
