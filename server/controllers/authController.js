import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (NO restaurant)
    const newUser = new User({
      name,
      email,
      phone,
      password: passwordHash
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User does not exist" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    // Send user without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
