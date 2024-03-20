const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getUsers,
  updateUser,
  softDeleteUser,
  unFreezeAccount,
  sendVerificationEmail,
  verifyUser
} = require("../Controllers/userController");

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
  fastify.post("/register", { schema: userSchema }, registerUser);
  fastify.post("/login", { schema: loginSchema }, loginUser);
  fastify.post("/logout", { preHandler: protect }, logoutUser);
  fastify.get("/:id", getUser);
  fastify.get("/", getUsers);
  fastify.put("/update/:id", { preHandler: protect }, updateUser);
  fastify.put("/freezeaccount/:id", { preHandler: protect }, softDeleteUser); 
  fastify.put("/unfreezeaccount", unFreezeAccount);
  fastify.post("/send-email-verification",sendVerificationEmail);
  fastify.post("/verify/:token", verifyUser);
}

module.exports = routes;
