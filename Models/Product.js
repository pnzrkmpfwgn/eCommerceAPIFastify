const { DataTypes } = require("sequelize");
const sequelize = require("../database/db_connection");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

// Define the Product model
const Product = sequelize.define("Products", {
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantityInStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vendorType:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deletedAt:{
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync();
    console.log("Product model synced successfully");
  } catch (error) {
    console.error("Error syncing Product model:", error);
  }
})();

// Export the Product model
module.exports = Product;