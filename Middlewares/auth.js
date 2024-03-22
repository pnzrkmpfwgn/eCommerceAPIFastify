const dotenv = require("dotenv");

// Load config
dotenv.config({ path: "./.env" });

//Protect routes
exports.protect = async (request, reply) => {
  const authorization = request.headers.authorization;
  const token = authorization ? authorization.replace("Bearer ", "") : null;

  try {
    await request.jwtVerify(token);
  } catch (err) {
    reply.code(401).send({ error: "Invalid token" });
  }
};

// Admin Authorization middleware
exports.adminAuthorize = async (request, reply) => {
  const authorization = request.headers.authorization;
  const token = authorization ? authorization.replace("Bearer ", "") : null;

  try {
    await request.jwtVerify(token);
  } catch (err) {
    reply.code(401).send({ error: "Invalid token" });
  }
};