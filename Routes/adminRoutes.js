const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  softDeleteUser,
  unFreezeAccount,
  resetPasswordSendEmail,
} = require("../Controllers/adminController");

const { protect } = require("../Middlewares/auth");

const userSchema = {
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      name: { type: "string" },
      surname: { type: "string" },
      msisdn: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
    required: [
      "username",
      "name",
      "surname",
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
  fastify.post("/register", { schema: userSchema }, registerAdmin);
  fastify.post("/login", { schema: loginSchema }, loginAdmin);
  fastify.post("/logout", { preHandler: protect }, logoutAdmin);
  fastify.get("/:id", getUser);
  fastify.get("/", getUsers);
  fastify.put("/update/:id", { preHandler: protect }, updateUser);
  fastify.delete("/delete/:id", { preHandler: protect }, deleteUser);
  fastify.put("/softdelete/:id", { preHandler: protect }, softDeleteUser);
  fastify.put("/unfreeze", unFreezeAccount);
  fastify.post("/sendpasswordresetemail", resetPasswordSendEmail);
}

module.exports = routes;
