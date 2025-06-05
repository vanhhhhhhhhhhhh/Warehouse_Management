const router = require('express').Router()
const roleController = require('../controller/roleController')
const middlewareController = require('../controller/middleware')

router.post('/', middlewareController.verifyToken, roleController.createRole)
router.get('/', middlewareController.verifyToken, roleController.getRoles)

module.exports = router

