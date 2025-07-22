const router = require('express').Router()
const inventoryController = require('../controller/inventoryController')
const middlewareController = require('../controller/middleware')

router.get('/', middlewareController.verifyToken, inventoryController.getInventoryReport)

module.exports = router 