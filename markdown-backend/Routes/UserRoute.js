import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../Models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "User Already Exists..." });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashPassword,
  });

  await newUser.save();
  return res.json({
    status: true,
    message: "Record Registered Successfully...",
  });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(404).json({ message: "Password is Incorrect" });
  }

  const maxAge = 3 * 24 * 60 * 60;
  const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
    expiresIn: maxAge,
  });
  res.cookie("token", token, { httpOnly: true, maxAge: maxAge });
  return res.json({ status: true, message: "Login Successfully" });
});

// Forgot-Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohamednathim84@gmail.com",
        pass: "fdkxdbrjjhcazlsk",
      },
    });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    const mailOptions = {
      from: "mohamednathim84@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetPassword/${encodedToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "Error senting Email" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// Reset-Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "Updated Password" });
  } catch (err) {
    return res.json({ message: "Invalid Token" });
  }
});

export { router as UserRouter };
