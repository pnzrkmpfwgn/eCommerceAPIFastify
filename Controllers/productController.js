const Product = require("../Models/Product");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

// Set Product as Admin
// This controller should be modified to fit the storage system that uses this api
// For now it is created in a basic form
const createProductAdmin = async (request, reply) => {
  try {
    const {
      name,
      imageUrl,
      price,
      quantityInStock,
      category,
      description,
      vendor,
    } = request.body;

    const product = await Product.create({
      name,
      imageUrl,
      price,
      quantityInStock,
      category,
      description,
      vendor,
    });

    reply.code(201).send({ msg: "Product Created", product: product });
  } catch (error) {
    reply.code(500).send({ error: error.toString() });
  }
};

// Get Proudct List as admin
const getProductAdmin = async (request, reply) => {
  const limit = parseInt(request.query.limit) || 10;
  try {
    const users = await Product.findAll({
      limit: limit,
      offset: 0,
      order: [["createdAt", "DESC"]],
    });
    reply.code(200).send(users);
  } catch (error) {
    reply.code(500).send({ error: error });
  }
};

// Get Product by ID as admin
const getProductByIDAdmin = async (request, reply) => {
  try {
    const productId = request.params.id;

    // Find the user in the database by ID
    const product = await Product.findByPk(productId);

    if (!product) {
      return reply.code(404).send({ error: "Product not found" });
    }

    reply.code(200).send(product);
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to get product", msg: error.message });
  }
};

// Get Products
const getProducts = async (request, reply) => {
  try {
    const limit = parseInt(request.query.limit) || 10;
    // Find all the products in the database
    const product = await Product.findAll(
      {
        limit: limit,
        offset: 0,
        order: [["createdAt", "DESC"]],
        where:{deletedAt: null}
      }
    );

    if (!product) {
      return reply.code(404).send({ error: "There Are no products." });
    }

    reply.code(200).send(product);
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to get products", msg: error.message });
  }
};

// Get Product by ID as User
const getProduct = async (request,reply)=>{
  try {
    const productId = request.params.id;

    // Find the user in the database by ID
    const product = await Product.findByPk(productId);

    if (!product || product.deletedAt !== null) {
      return reply.reply(404).send({ error: "Product not found" });
    }

    reply.reply(200).send(product);
  } catch (error) {
    reply
      .reply(500)
      .send({ error: "Failed to get product", msg: error.message });
  }
}

// Update Produt by ID as admin
const updateProductByIDAdmin = async (request, reply) => {
  try {
    const productId = request.params.id;
    const updateData = request.body;

    const [numberOfAffectedRows, affectedRows] = await Product.update(
      updateData,
      {
        where: { productId: productId },
        returning: true, // needed for affectedRows to be populated
      }
    );

    if (numberOfAffectedRows < 1) {
      return reply.code(404).send({ error: "Product not found" });
    }

    reply.code(200).send(affectedRows);
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to update product", msg: error.message });
  }
};

// Soft Delete Product by ID as admin
const softDeleteProductByIDAdmin = async (request, reply) => {
  try {
    const productId = request.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return reply.code(404).send({ error: "User not found" });
    }
    product.update({ deletedAt: new Date() });
    return reply.code(200).send({ msg: "Product soft deleted" });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to soft delete product", msg: error.message });
  }
};

// Perma Delete Product by ID as admin
const permaDeleteProductByIDAdmin = async (request, reply) => {
  try {
    const productId = request.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return reply.code(404).send({ error: "User not found" });
    }
    product.destroy();
    return reply.code(200).send({ msg: "Product perma deleted" });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to perma delete product", msg: error.message });
  }
};

// Recover Product by ID as admin
const recoverProductByIDAdmin = async (request, reply) => {
  try {
    const productId = request.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return reply.code(404).send({ error: "User not found" });
    }
    product.update({ deletedAt: null });
    return reply.code(200).send({ msg: "Product recovered" });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to recover product", msg: error.message });
  }
};

// Export the controllers
module.exports = {
  createProductAdmin,
  getProductAdmin,
  getProductByIDAdmin,
  getProducts,
  getProduct,
  updateProductByIDAdmin,
  softDeleteProductByIDAdmin,
  recoverProductByIDAdmin,
  permaDeleteProductByIDAdmin,
};