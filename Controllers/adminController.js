const User = require("../Models/User");
const Admin = require("../Models/Admin");
const sendEmail = require("../Utils/sendEmail");

const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

// Test Everything before doing anything here!!!
// TODO: Username should not contain special characters

// Register a new user
const registerAdmin = async (request, reply) => {
  try {
    // Get user data from request body
    const { name, surname, msisdn, email, password } = request.body;

    // Create a new user instance
    const newUser = new Admin({
      name,
      surname,
      msisdn,
      email,
      password,
    });

    // Save the user to the database
    await newUser.save();

    // TO DO: Send a welcome SMS to the user
    // TO DO: Send a welcome email to the user

    const user = await Admin.findOne({ where: { email: email } });
    const token = await reply.jwtSign(
      { id: user.id, role: "admin" },
      {
        expiresIn: "5 days",
      }
    );
    
    reply.code(201).send({
      message: "Admin registered successfully",
      token: token,
    });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Login user
const loginAdmin = async (request, reply) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return reply.code(400).send({ error: errors.array() });
  }
  try {
    // Get user credentials from request body
    const { email, password } = request.body;

    // Find the user in the database
    const user = await Admin.findOne({
      where: { email: email },
      attributes: ["id", "name", "surname", "password"],
    });
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return reply.code(401).send({ error: "Invalid password" });
    }

    //Generate jwt token
    const token = await reply.jwtSign(
      {
        id: user.id,
        role: "admin",
      },
      { expiresIn: "5 days" }
    );

    reply.code(200).send({ msg: "Admin logged in successfully", token: token });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to login", msg: error.message, details: error });
  }
};

// Logout user
const logoutAdmin = async (request, reply) => {
  console.log("Logged out");
  try {
    reply.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return reply.code(200).send({
      success: true,
      data: {},
    });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to logout", msg: error.message, details: error });
  }
};

//Get User List
const getUsers = async (request, reply) => {
  const limit = parseInt(request.query.limit) || 10;
  try {
    const users = await User.findAll({
      limit: limit,
      offset: 0,
      order: [["createdAt", "DESC"]],
    });
    reply.code(200).send(users);
  } catch (error) {
    reply.code(500).send({ error: error });
  }
};

// Get user by ID
// This countroller can have a protected route, but it is up to the product owner.
const getUser = async (request, reply) => {
  try {
    const userId = request.params.id;

    // Find the user in the database by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    reply.code(200).send(user);
  } catch (error) {
    reply.code(500).send({ error: "Failed to get user", msg: error.message });
  }
};

// Update user by ID
const updateUser = async (request, reply) => {
  console.log("Update controller Executed");
  try {
    const userId = request.params.id;
    const updateData = request.body;

    const [numberOfAffectedRows, affectedRows] = await User.update(updateData, {
      where: { id: userId },
      returning: true, // needed for affectedRows to be populated
    });

    // The successfully updated user (if any)
    const updatedUser =
      affectedRows && numberOfAffectedRows > 0 ? affectedRows[0] : null;

    if (!updatedUser) {
      return reply.code(404).send({ error: "User not found" });
    }

    reply.code(200).send({ msg: "Successfully updated" });
  } catch (error) {
    reply.code(500).send({ error: "Failed to update user", msg: error });
  }
};

// Delete user by ID
const deleteUser = async (request, reply) => {
  const id = request.params.id;

  try {
    const numberOfDestroyedRows = await User.destroy({
      where: { id },
    });

    if (numberOfDestroyedRows > 0) {
      reply.code(200).send({ msg: "User Deleted" }); // No Content
    } else {
      reply.code(404).send({ error: "User not found" });
    }
  } catch (error) {
    reply.code(500).send({ error: error.toString() });
  }
};

// Soft Delete User by ID
const softDeleteUser = async (request, reply) => {
  const id = request.params.id;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    user.update({ deletedAt: new Date() });
    reply.code(200).send({ msg: "User Deleted" });
  } catch (error) {
    reply.code(500).send({ error: error.toString() });
  }
};

// Unfreeze Account by ID
const unFreezeAccount = async (request, reply) => {
  const id = request.params.id;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    user.update({ deletedAt: null });
    reply.code(200).send({ msg: "User Unfrozen" });
  } catch (error) {
    reply.code(500).send({ error: error.toString() });
  }
};

//  Send Email Reset Password to user
const resetPasswordSendEmail = async (request, reply) => {
  const { email } = request.body;
  const user = await User.findOne({ email });

  try {
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    const token = await reply.jwtSign({ userEmail: user.email }, {
      expiresIn: "1h",
    });

    // !!!!
    console.log(token);
    // !!!!
    await sendEmail(
      email,
      "Reset Password",
      "Please click the link below to reset your password",
      `
              <h1>Reset Password</h1>
              <p>Reset Password with below link</p>
              <p>If you didn't requested password reset ignore this email.</p>
              <br />
              <a href="http://localhost:3000/api/users/resetPassword/${token}">Reset Password</a>
              `
    );
    reply.code(200).send({ message: "Password reset link sent to your email" });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

module.exports = {
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
};
