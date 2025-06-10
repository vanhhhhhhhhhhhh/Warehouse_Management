const router = require('express').Router()
const roleController = require('../controller/roleController')
const middlewareController = require('../controller/middleware')

router.post('/', middlewareController.verifyToken, roleController.createRole)
router.get('/', middlewareController.verifyToken, roleController.getRoles)
router.put('/:roleId', middlewareController.verifyToken, roleController.updateRole)
router.get('/:roleId', middlewareController.verifyToken, roleController.getRoleById)
router.delete('/:id', middlewareController.verifyToken, roleController.deleteRole)

module.exports = router

