const {
    createProductAdmin,
    getProductAdmin,
    getProductByIDAdmin,
    updateProductByIDAdmin,
    softDeleteProductByIDAdmin,
    recoverProductByIDAdmin,
    permaDeleteProductByIDAdmin,
    getProducts,
    getProduct
  } = require("../Controllers/productController");
  
  const { protect } = require("../Middlewares/auth");
  
  const userSchema = {
    body: {
      type: "object",
      properties: {
        username: { type: "string" },
        name: { type: "string" },
        surname: { type: "string" },
        dob: { type: "string", format: "date" },
        msisdn: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
      required: [
        "username",
        "name",
        "surname",
        "dob",
        "msisdn",
        "email",
        "password",
      ],
    },
  };
  
  const loginSchema = {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
      required: ["email", "password"],
    },
  };
  
  async function routes(fastify, options) {
    fastify.post("/admincreateproduct", { schema: userSchema }, createProductAdmin);
    fastify.get("/admingetproducts", { schema: loginSchema }, getProductAdmin);
    fastify.get("/admingetproduct/:id", getProductAdmin);
    fastify.get("/getproducts", getProducts);
    fastify.get("/getproduct/:id", getProduct);
    fastify.put("/adminupdateproduct/:id", { preHandler: protect }, updateProductByIDAdmin);
    fastify.put("/adminsoftdeleteproduct/:id", { preHandler: protect }, softDeleteProductByIDAdmin); 
    fastify.put("/adminrecoverproduct", recoverProductByIDAdmin);
    fastify.post("/deleteproductadmin/:id", permaDeleteProductByIDAdmin);
  }
  
  module.exports = routes;
  