const router = require('express').Router()
const exportCtrl = require('../controller/exportWarehouseController')
const middleware = require('../controller/middleware')

router.get('/warehouse', middleware.verifyToken, exportCtrl.listWarehouse)
router.get('/history', middleware.verifyToken, exportCtrl.getExportHistory)
router.post('/fromWarehouse',middleware.verifyToken, exportCtrl.createExport)
router.get('/receipt/:id', middleware.verifyToken, exportCtrl.exportReceipt)


module.exports = router
