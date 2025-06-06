const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('../model/Category');
const Product = require('../model/Product');

// Database connection configuration
const url = process.env.URL;
const dbName = process.env.DBNAME;

const adminId = new mongoose.Types.ObjectId();

// Sample categories data
const categoriesData = [
  {
    name: "Electronics",
    adminId,
    isDelete: false
  },
  {
    name: "Office Supplies",
    adminId,
    isDelete: false
  },
  {
    name: "Tools & Hardware",
    adminId,
    isDelete: false
  },
  {
    name: "Furniture",
    adminId,
    isDelete: false
  },
  {
    name: "Safety Equipment",
    adminId,
    isDelete: false
  },
  {
    name: "Cleaning Supplies",
    adminId,
    isDelete: false
  }
];

// Sample products data (without category IDs initially)
const productsTemplate = [
  {
    code: "ELC-001",
    name: "Wireless Bluetooth Headphones",
    categoryName: "Electronics",
    image: "headphones.jpg",
    description: "High-quality wireless Bluetooth headphones with noise cancellation",
    price: 89.99,
    attribute: [
      { name: "Brand", value: "TechSound" },
      { name: "Color", value: "Black" },
      { name: "Battery Life", value: "30 hours" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "ELC-002",
    name: "USB-C Charging Cable",
    categoryName: "Electronics",
    image: "usb-c-cable.jpg",
    description: "Fast charging USB-C to USB-A cable, 6 feet length",
    price: 12.99,
    attribute: [
      { name: "Length", value: "6 feet" },
      { name: "Type", value: "USB-C to USB-A" },
      { name: "Fast Charging", value: "Yes" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "OFF-001",
    name: "Ballpoint Pens (Pack of 12)",
    categoryName: "Office Supplies",
    image: "ballpoint-pens.jpg",
    description: "Blue ink ballpoint pens, smooth writing, pack of 12",
    price: 8.50,
    attribute: [
      { name: "Ink Color", value: "Blue" },
      { name: "Pack Size", value: "12 pens" },
      { name: "Tip Size", value: "1.0mm" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "OFF-002",
    name: "A4 Copy Paper (500 sheets)",
    categoryName: "Office Supplies",
    image: "a4-paper.jpg",
    description: "High-quality white A4 copy paper, 80gsm, 500 sheets",
    price: 15.99,
    attribute: [
      { name: "Size", value: "A4" },
      { name: "Weight", value: "80gsm" },
      { name: "Sheets", value: "500" },
      { name: "Color", value: "White" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "TOL-001",
    name: "Cordless Electric Drill",
    categoryName: "Tools & Hardware",
    image: "cordless-drill.jpg",
    description: "18V cordless electric drill with 2 batteries and charger",
    price: 129.99,
    attribute: [
      { name: "Voltage", value: "18V" },
      { name: "Batteries Included", value: "2" },
      { name: "Chuck Size", value: "1/2 inch" },
      { name: "Brand", value: "PowerTech" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "TOL-002",
    name: "Screwdriver Set (30 pieces)",
    categoryName: "Tools & Hardware",
    image: "screwdriver-set.jpg",
    description: "Professional screwdriver set with magnetic tips, 30 pieces",
    price: 34.99,
    attribute: [
      { name: "Pieces", value: "30" },
      { name: "Magnetic Tips", value: "Yes" },
      { name: "Case Included", value: "Yes" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "FUR-001",
    name: "Office Chair - Ergonomic",
    categoryName: "Furniture",
    image: "office-chair.jpg",
    description: "Ergonomic office chair with lumbar support and adjustable height",
    price: 199.99,
    attribute: [
      { name: "Material", value: "Mesh and Fabric" },
      { name: "Adjustable Height", value: "Yes" },
      { name: "Lumbar Support", value: "Yes" },
      { name: "Color", value: "Black" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "FUR-002",
    name: "Standing Desk - Adjustable",
    categoryName: "Furniture",
    image: "standing-desk.jpg",
    description: "Electric height-adjustable standing desk, 48x30 inches",
    price: 399.99,
    attribute: [
      { name: "Size", value: "48x30 inches" },
      { name: "Height Range", value: "28-48 inches" },
      { name: "Electric Motor", value: "Yes" },
      { name: "Weight Capacity", value: "220 lbs" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "SAF-001",
    name: "Safety Goggles",
    categoryName: "Safety Equipment",
    image: "safety-goggles.jpg",
    description: "Anti-fog safety goggles with UV protection",
    price: 24.99,
    attribute: [
      { name: "UV Protection", value: "Yes" },
      { name: "Anti-Fog", value: "Yes" },
      { name: "Adjustable Strap", value: "Yes" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "SAF-002",
    name: "Hard Hat - Construction",
    categoryName: "Safety Equipment",
    image: "hard-hat.jpg",
    description: "OSHA-compliant construction hard hat with 4-point suspension",
    price: 18.99,
    attribute: [
      { name: "OSHA Compliant", value: "Yes" },
      { name: "Suspension", value: "4-point" },
      { name: "Color", value: "Yellow" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "CLN-001",
    name: "All-Purpose Cleaner (32oz)",
    categoryName: "Cleaning Supplies",
    image: "all-purpose-cleaner.jpg",
    description: "Concentrated all-purpose cleaner, safe for multiple surfaces",
    price: 7.99,
    attribute: [
      { name: "Size", value: "32 oz" },
      { name: "Concentrated", value: "Yes" },
      { name: "Multi-Surface", value: "Yes" }
    ],
    adminId,
    isDelete: false
  },
  {
    code: "CLN-002",
    name: "Microfiber Cleaning Cloths (12-pack)",
    categoryName: "Cleaning Supplies",
    image: "microfiber-cloths.jpg",
    description: "Ultra-absorbent microfiber cleaning cloths, washable and reusable",
    price: 16.99,
    attribute: [
      { name: "Pack Size", value: "12 cloths" },
      { name: "Material", value: "Microfiber" },
      { name: "Washable", value: "Yes" },
      { name: "Size", value: "12x12 inches" }
    ],
    adminId,
    isDelete: false
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${url}${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared');

    // Insert categories and get their IDs
    console.log('Inserting categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`${insertedCategories.length} categories inserted successfully`);

    // Create a mapping of category names to IDs
    const categoryMap = {};
    insertedCategories.forEach(category => {
      categoryMap[category.name] = category._id;
    });

    // Prepare products data with correct category IDs
    const productsData = productsTemplate.map(product => {
      const { categoryName, ...productWithoutCategoryName } = product;
      return {
        ...productWithoutCategoryName,
        cateId: categoryMap[categoryName]
      };
    });

    // Insert products
    console.log('Inserting products...');
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`${insertedProducts.length} products inserted successfully`);

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log(`Categories inserted: ${insertedCategories.length}`);
    console.log(`Products inserted: ${insertedProducts.length}`);

    // Display category mapping for reference
    console.log('\nCategory ID Mapping:');
    Object.entries(categoryMap).forEach(([name, id]) => {
      console.log(`  ${name}: ${id}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();
