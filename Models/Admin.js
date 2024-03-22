const bcrypt = require("bcrypt");
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db_connection");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const User = sequelize.define(
  'Admins',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    msisdn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Comparing password:
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Sync the model with the database
(async () => {
  try {
      await sequelize.sync();
      console.log('Product model synced successfully');
  } catch (error) {
      console.error('Error syncing Product model:', error);
  }
})();

module.exports = User;