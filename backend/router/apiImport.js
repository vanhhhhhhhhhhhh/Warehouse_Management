const importController = require('../controller/importController')
const router = require('express').Router()
const middleware = require('../controller/middleware')

router.get('/warehouse', middleware.verifyToken, importController.listWarehouse)

module.exports = router