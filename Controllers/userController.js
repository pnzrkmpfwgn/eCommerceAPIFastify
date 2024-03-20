const User = require("../Models/User");
const dotenv = require("dotenv");
const sendEmail = require("../Utils/sendEmail");

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

// Login user
const loginUser = async (request, reply) => {
  try {
    // Get user credentials from request body
    const { email, password } = request.body;

    // Find the user in the database
    const user = await User.findOne({
      where: { email: email },
      attributes: ["id", "username", "name", "surname", "password"],
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
    const token = await reply.jwtSign({ id: user.id }, { expiresIn: "5 days" });

    reply.code(200).send({ msg: "User logged in successfully", token: token });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Failed to login", msg: error.message, details: error });
  }
};

// Logout user
///!!!/// This route might be redundant
const logoutUser = async (request, reply) => {
  console.log("Logged out");
  try {
    reply.setCookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return reply.code(200).send({
      success: true,
      data: {},
    });
    // res.status(200).json({ message: "User logged out successfully" });
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
      attributes: ["username", "name", "surname"],
      where: {
        deletedAt: null,
      },
    });
    reply.code(200).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Get user by ID
// This countroller can have a protected route, but it is up to the product owner.
const getUser = async (request, reply) => {
  try {
    const userId = request.params.id;

    // Find the user in the database by ID
    const user = await User.findByPk(userId, {
      attributes: ["username", "name", "surname", "deletedAt"],
    });

    if (!user || user.deletedAt !== null) {
      return reply.code(404).send({ error: "User not found" });
    }

    reply.code(200).send(user);
  } catch (error) {
    reply.code(500).send({ error: "Failed to get user", msg: error.message });
  }
};

// Update user by ID
const updateUser = async (request, reply) => {
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

// Soft Delete user by ID (Freeze Account)
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
  // TO DO: Add a logic for unfreezing the account after some time
};

// Unfreeze Account by email
// ! // This controller should be modified according to the frontend
const unFreezeAccount = async (request, reply) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return reply.code(401).send({ error: "Invalid password" });
    }

    user.update({ deletedAt: null });
    reply.code(200).send({ msg: "User Account Unfrozen" });
  } catch (error) {
    reply.code(500).send({ error: error.toString() });
  }
};

// Verify user
const verifyUser = async (request, reply) => {
  try {
    if (!request.query.token) {
      return reply.code(400).send({ error: "Invalid token" });
    }
    const token = request.query.token;

    const decoded = await request.jwtVerify(token);

    if(!decoded) return reply.code(400).send({ error: "Invalid token" });

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return reply.code(400).send({ error: "Invalid token" });
    } else {
      await user.update({ isVerified: true });

      return reply
        .code(200)
        .send({ message: "User verified successfully"});
    }
  } catch (err) {
    return reply.code(500).send({ error: err.message });
  }
};

// Note : You might need to limit the amount of email that can be sent
// so the malicious users wouldn't abuse the system
// Send verification email again
const sendVerificationEmail = async (request, reply) => {
  const { email } = request.body;
  const user = await User.findOne({ email });

  try {
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    const token = await reply.jwtSign(
      { id: user.id },
      {
        expiresIn: "5 days",
      }
    );
    // Send Email
    await sendEmail(
      email,
      "Welcome to E-Commerce",
      "Please confirm your email address by clicking the link below",
      `
            <h1>Welcome to E-Commerce</h1>
            <p>Please confirm your email address by clicking the link below</p>
            <br />
            <a href="http://localhost:3000/api/users/verify/${token}">Confirm Email</a>
            `
    );
    reply.code(200).send({ message: "Verification email sent" });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Reset Password Send Email
const resetPasswordSendEmail = async (request, reply) => {
  const { email } = request.body;
  const user = await User.findOne({ email });

  try {
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    const token = await reply.jwtSign(
      { userEmail: user.email },
      {
        expiresIn: "1h",
      }
    );

    console.log(token);
    reply.code(200).send({ message: "Password reset link sent to your email" });
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
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Send token via headers
// Reset Password
const resetPassword = async (request, reply) => {
  const token = request.params.token;
  try {
    const decoded = await request.jwtVerify(token);

    const user = await User.findOne({ email: decoded.userEmail });
    // console.log("Decoded: ", decoded);
    if (!token) {
      return reply.code(400).send({ error: "Invalid token" });
    }

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(request.body.password, salt);
    await user.update({ password: password });

    reply.code(200).send({ message: "Password reset successfully" });
  } catch (error) {
    reply.code(500).send({ msg: "Error", error: error.message });
  }
};

// Export the module
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  softDeleteUser,
  unFreezeAccount,
  verifyUser,
  sendVerificationEmail,
  resetPasswordSendEmail,
  resetPassword,
};
