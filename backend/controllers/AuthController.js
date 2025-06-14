const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Signup Controller
const signup = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User Already Exists. Please login.", success: false });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      pic: pic || ''
    });

    await newUser.save();

    res.status(201).json({ message: "Signup successful", success: true,
      _id:newUser._id,
      name:newUser.name,
      email:newUser.email,
      pic:newUser.pic
   
     });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errorMsg = "Invalid Email or Password";

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: "Login Successful",
      success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic || '',
        jwtToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select("-password");
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
  }
};

// Fetch all users except the logged-in user (based on query)
const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {};

    // Exclude the logged-in user
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).json(users);
  } catch (error) {
    console.error("allUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users", success: false });
  }
};

module.exports = {
  signup,
  login,
  protect,
  allUsers
};
