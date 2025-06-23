const importController = require('../controller/importController')
const router = require('express').Router()
const middleware = require('../controller/middleware')

router.get('/warehouse', middleware.verifyToken, importController.listWarehouse)

router.get('/product', middleware.verifyToken, importController.listProduct)

module.exports = router