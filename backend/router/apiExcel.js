const express = require('express')
const router = express.Router()
const excelController = require('../controller/excelController')
const middlewareController = require('../controller/middleware')
const { failedResponse } = require('../utils')
const multer = require('multer')

const upload = multer({
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.mimetype !== 'application/vnd.ms-excel') {
      return cb(new Error('Chỉ hỗ trợ file Excel'));
    }
    cb(null, true);
  },
  storage: multer.memoryStorage()
})

const singleFileMulter = upload.single('file')
const TRANSLATIONS = {
  "LIMIT_FILE_SIZE": "Kích thước file quá lớn",
}

const singleFile = (req, res, next) => {
  singleFileMulter(req, res, (err) => {
    if (err) {
      console.error(err);
      return failedResponse(res, 400, TRANSLATIONS[err.code] || err.message);
    }

    next();
  });
}

router.post('/import', middlewareController.verifyToken, singleFile, excelController.importFile)
router.get('/export', middlewareController.verifyToken, excelController.exportFile)

module.exports = router
