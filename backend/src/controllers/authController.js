const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    console.log("REGISTER BODY >>>", req.body);   // 🔍 debug log

    // 1️⃣ If body is missing, return clear error instead of crashing
    if (!req.body) {
      return res.status(400).json({ message: "No request body received" });
    }

    const { name, email, password } = req.body;

    // 2️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash: hash });

    return res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.log("REGISTER ERROR >>>", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("LOGIN BODY >>>", req.body);

    if (!req.body) {
      return res.status(400).json({ message: "No request body received" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.log("LOGIN ERROR >>>", err);
    return res.status(500).json({ message: "Server error" });
  }
};
