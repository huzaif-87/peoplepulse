const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Generate JWT containing only necessary payload (userId and role)
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing");
  }
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const registerUser = async (userData = {}) => {
  const { name, email, password, role } = userData;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw createError(400, "Name is required and must be at least 2 characters long");
  }

  if (!email || typeof email !== "string" || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email.trim())) {
    throw createError(400, "Please provide a valid email address");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw createError(400, "Password is required and must be at least 8 characters long");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw createError(409, "Email is already registered");
  }

  // Create user record (pre-save hook hashes password)
  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role === "ADMIN" ? "ADMIN" : "HR"
  });

  const token = generateToken(newUser._id.toString(), newUser.role);

  return {
    user: {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    },
    token
  };
};

const loginUser = async (credentials = {}) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw createError(401, "Invalid email or password");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Explicitly include +password for verification
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw createError(401, "Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw createError(401, "Invalid email or password");
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw createError(404, "User not found");
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserById
};
