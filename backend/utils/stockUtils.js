const mongoose = require('mongoose');
const Stock_Import = require('../model/Stock_Import');
const Stock_Export = require('../model/Stock_Export');
const Stock_Error = require('../model/Stock_Error');

const calculateProductRemain = async (proId, wareId) => {
  const productId = new mongoose.Types.ObjectId(proId);
  const warehouseId = new mongoose.Types.ObjectId(wareId);

  // Tổng nhập
  const totalImport = await Stock_Import.aggregate([
    { $match: { wareId: warehouseId } },
    { $unwind: '$items' },
    { $match: { 'items.proId': productId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$items.quantity' }
      }
    }
  ]);

  // Tổng xuất
  const totalExport = await Stock_Export.aggregate([
    { $match: { wareId: warehouseId } },
    { $unwind: '$items' },
    { $match: { 'items.proId': productId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$items.quantity' }
      }
    }
  ]);

  // Tổng lỗi
  const totalError = await Stock_Error.aggregate([
    { $match: { wareId: warehouseId, proId: productId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' }
      }
    }
  ]);

  const importQty = totalImport[0]?.total || 0;
  const exportQty = totalExport[0]?.total || 0;
  const errorQty = totalError[0]?.total || 0;

  const remain = importQty - exportQty - errorQty;

  return remain < 0 ? 0 : remain; // Không cho tồn kho âm
};

module.exports = {
  calculateProductRemain
};
