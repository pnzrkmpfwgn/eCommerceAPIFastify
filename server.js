const fastify = require("fastify")({
  logger: true,
});
const { Sequelize } = require("sequelize");
const userRoutes = require("./Routes/userRoutes");
const jwt = require("@fastify/jwt");
const { readFileSync } = require('node:fs')
const path = require('node:path')

const dotenv = require("dotenv");

dotenv.config({ path: "./env" });

// Register JWT
fastify.register(jwt, {
  secret: {
    private:readFileSync(`${path.join(__dirname, 'certs')}/private.key`, 'utf8'),
    public: readFileSync(`${path.join(__dirname, 'certs')}/public.key`, 'utf8')
  },
  sign: {
    algorithm: 'RS256',
    expiresIn: '1h',
    issuer: 'ecommerceFastify'
  },
  verify: {
    algorithms: ['RS256'],
    issuer: ['ecommerceFastify']
  }
})

// DB Connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("Connection has been establishedp successfully."))
  .catch((error) => console.error("Unable to connect to the database:", error));

// Mount the routes
fastify.register(userRoutes, { prefix: "/api/users" });

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
