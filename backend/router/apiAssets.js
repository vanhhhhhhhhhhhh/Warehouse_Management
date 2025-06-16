const express = require("express");
const router = express.Router();
const assetsController = require("../controller/assetsController");

router.get("/:id", assetsController.getAssetById);

module.exports = router;
