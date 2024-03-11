const User = require("../Models/User");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

// Register a new user
const registerUser = async (request, reply) => {
  try {
    // Get user data from request body
    const { username, name, surname, dob, msisdn, email, password } =
      request.body;
    const userType = "Buyer";
    // Create a new user instance
    const newUser = new User({
      username,
      userType,
      name,
      surname,
      dob,
      msisdn,
      email,
      password,
    });

    // Save the user to the database
    await newUser.save();

    // TO DO: Send a welcome SMS to the user
    // TO DO: Send a welcome email to the user

    const user = await User.findOne({ where: { email: email } });
    const token = await reply.jwtSign({ id: user.id }, { expiresIn: "5 days" });

    // Commented out for now.
    // await sendEmail(
    //   newUser.email,
    //   "Welcome to E-Commerce",
    //   "Please confirm your email address by clicking the link below",
    //   `
    //         <h1>Welcome to E-Commerce</h1>
    //         <p>Please confirm your email address by clicking the link below</p>
    //         <br />
    //         <a href="http://localhost:3000/api/users/verify/${token}">Confirm Email</a>
    //         `)

    reply.code(201).send({
      message: "User registered successfully, Confirmation mail sent",
      token: token,
    });
  } catch (error) {
    reply.code(500).send({ message: error.message });
  }
};

module.exports = { registerUser };
