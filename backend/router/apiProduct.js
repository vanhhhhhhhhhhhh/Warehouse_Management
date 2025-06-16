const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { storage } = require("../utils/gridfs");

// Routes
router.get("/", productController.listProduct);
router.get("/:id", productController.getProduct);
router.post("/", storage.single("image"), productController.createProduct);
router.put("/:id", storage.single("image"), productController.updateProduct);
router.post("/deactivate", productController.deactivateProduct);
router.post("/activate", productController.activateProduct);

module.exports = router;
