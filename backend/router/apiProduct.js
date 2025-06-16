const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { singleImage } = require("../utils/gridfs");
const middlewareController = require("../controller/middleware");

// Routes
router.get("/", middlewareController.verifyToken, productController.listProduct);
router.get("/:id", middlewareController.verifyToken, productController.getProduct);
router.post("/", middlewareController.verifyToken, singleImage, productController.createProduct);
router.put("/:id", middlewareController.verifyToken, singleImage, productController.updateProduct);
router.post("/deactivate", middlewareController.verifyToken, productController.deactivateProduct);
router.post("/activate", middlewareController.verifyToken, productController.activateProduct);

module.exports = router;
