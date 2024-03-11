const fastify = require("fastify")({
  logger: true,
});
const {registerUser} = require("../Controllers/userController");

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

async function routes(fastify, options) {
  fastify.post("/register", { schema: userSchema }, registerUser);
}

module.exports = routes;
