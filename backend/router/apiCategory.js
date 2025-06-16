const express = require('express')
const router = express.Router()
const categoryController = require('../controller/categoryController')
const middlewareController = require('../controller/middleware')

router.get('/', middlewareController.verifyToken, categoryController.listCategory)
router.get('/:id', middlewareController.verifyToken, categoryController.getCategory)
router.post('/', middlewareController.verifyToken, categoryController.createCategory)
router.put('/:id', middlewareController.verifyToken, categoryController.updateCategory)
router.post('/deactivate', middlewareController.verifyToken, categoryController.deactivateCategories)
router.post('/activate', middlewareController.verifyToken, categoryController.activateCategories)

module.exports = router
