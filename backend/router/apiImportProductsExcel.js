const express = require('express')
const router = express.Router()
const importController = require('../controller/importController')
const middlewareController = require('../controller/middleware')

router.get('/import', middlewareController.verifyToken, importController.importFile)

module.exports = router
