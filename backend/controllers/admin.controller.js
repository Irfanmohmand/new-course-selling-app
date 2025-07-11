import bcrypt from "bcrypt";
import { z } from "zod";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import config from "../config.js";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Zod schema for admin signup
  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 characters long." }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters long." }),
    email: z.string().email({ message: "Invalid email format." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." })
  });

  const validateData = adminSchema.safeParse(req.body);

  if (!validateData.success) {
    return res.status(400).json({
      errors: validateData.error.issues.map((err) => err.message)
    });
  }

  try {
    const existingEmail = await Admin.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        errors: "User already exists."
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new Admin({
      firstName,
      lastName,
      email,
      password: hashPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "Admin registered successfully.",
      newUser
    });

  } catch (error) {
    console.error("Error creating signup page:", error);
    return res.status(500).json({
      errors: "Server error while creating signup."
    });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        errors: "User not found."
      });
    };

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(404).json({
        errors: "Invalid credentials."
      });
    };

    const token = jwt.sign({ id: admin._id }, config.JWT_ADMIN_PASSWORD, { expiresIn: "1d" });

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("jwt", token, cookieOptions);
    return res.status(200).json({
      message: "Admin login successfully.",
      admin,
      token
    });

  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).json({
      errors: "Error in login."
    })
  }

};


export const logout = async (req, res) => {
  try {

    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logout successfully."
    });

  } catch (error) {
    console.log("Error in logout.");
    return res.status(500).json({
      errors: "Error in login"
    });
  };
};