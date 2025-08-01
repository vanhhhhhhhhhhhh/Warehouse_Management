const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const exp = require("constants");
const apiAuth = require("./router/apiAuth");
const apiRole = require("./router/apiRole");
const apiProduct = require("./router/apiProduct");
const apiCategory = require("./router/apiCategory");
const apiUser = require("./router/apiUser");
const apiImage = require("./router/apiImage");
const apiWarehouse = require("./router/apiWarehouse");
const apiImportWarehouse = require("./router/apiImportWarehouse");
const apiExportWarehouse = require("./router/apiExportWarehouse");
const apiError = require("./router/apiError")
const apiExcel = require("./router/apiExcel")
const apiInventory = require('./router/apiInventory')

const dotenv = require("dotenv");
const path = require("path");

const app = express();
app.use(express.json());

// Cấu hình CORS chi tiết
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV === "test") {
  const envPath = path.join(__dirname, "./.env.test");

  dotenv.config({
    path: envPath,
  });
} else {
  const envPath = path.join(__dirname, "./.env.prod");

  dotenv.config({
    path: envPath,
  });
}

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;
const url = process.env.URL;
const dbName = process.env.DBNAME;

mongoose
  .connect(`${url}${dbName}`)
  .then(() => NODE_ENV !== "test" && console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/static", express.static("static"))

// AUTHENTICATION
app.use("/auth", apiAuth);

// ROLES
app.use("/roles", apiRole);

// CATEGORIES
app.use("/categories", apiCategory);

// PRODUCTS
app.use("/products", apiProduct);

// USERS
app.use("/users", apiUser);

// IMAGES
app.use("/images", apiImage);

// WAREHOUSES
app.use("/warehouses", apiWarehouse);

// IMPORT PRODUCT INTO WAREHOUSE
app.use("/import", apiImportWarehouse)

// EXPORT PRODUCT FROM WAREHOUSE
app.use("/export", apiExportWarehouse);
// DECLARE ERROR PRODUCT
app.use("/error", apiError)

app.use("/excel", apiExcel)
app.use('/inventory', apiInventory)

if (NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });
}

module.exports = app;
