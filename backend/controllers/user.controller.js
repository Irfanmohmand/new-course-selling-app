import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import config from "../config.js";
import jwt from "jsonwebtoken";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

// Signup page
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z.string().min(3, { message: "firstName must be at least 6 char long" }),
    lastName: z.string().min(3, { message: "lastName must be at least 6 char long" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 char long" })
  });

  const validateData = userSchema.safeParse(req.body);
  if (!validateData.success) {
    return res.status(404).json({
      errors: validateData.error.issues.map(err => err.message)
    })
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {

    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      return res.status(404).json({
        errors: "Email already exists."
      });
    };

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successed.",
      newUser
    });

  } catch (error) {
    console.log("Error creating signup page.");
    return res.status(500).json({
      errors: "Error creating signup page."
    });
  };
};


// login page
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        errors: "Invalid credentials."
      });
    };

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({
        errors: "Invalid credentials."
      });
    };


    const token = jwt.sign({ id: user._id }, config.JWT_USER_PASSWORD, { expiresIn: "1d" });

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true, // can't access via js directly.
      secure: process.env.NODE_ENV === "production", // true for https only
      sameSite: "Strict", // CSRF attacks
    };

    res.cookie("jwt", token, cookieOptions);
    return res.status(201).json({
      message: "Login successfully",
      user,
      token
    });

  } catch (error) {
    console.log("Error in login");
    return res.status(500).json({
      errors: "Error in login", error
    });
  };
};



// logout page
export const logout = async (req, res) => {
  try {

    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logged out successfully."
    })

  } catch (error) {
    return res.status(500).json({
      errors: "Error in logout."
    })
    console.log("Error in logout", error);

  }
};


// purchased course

// You query the Purchase collection:

// const purchased = await Purchase.find({ userId });
// This gives you all documents from the Purchase collection where the current user is the buyer.

// Each purchased document looks like:

// You loop through purchased and extract courseId from each document:
// purchasedCourseId.push(purchased[i].courseId);
// ✅ So yes — you are getting courseId from the purchased documents,
//   which you fetched from the Purchase collection



// $in is a MongoDB query operator used to match values that are inside a given array.

//   It’s like saying:

// “Give me all documents where a field’s value is in this list of values.”

// const courseData = await Course.find({
//   _id: { $in: purchasedCourseId }
// });
// Let’s break it down:

// Course.find({ ... }): Find courses in the Course collection.

//   _id: { $in: [...] }: Only include courses whose _id is in the array purchasedCourseId.


// method one
export const purchases = async (req, res) => {
  const { userId } = req;

  try {
    const purchased = await Purchase.find({ userId });

    const purchasedCourseId = purchased.map(item => item.courseId);

    const courseData = await Course.find({
      _id: { $in: purchasedCourseId }
    });

    return res.status(200).json({
      purchased,
      courseData
    });

  } catch (error) {
    console.log("Error in purchase", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};





// map method.. method 2
// export const purchases = async (req, res) => {
//   const { userId } = req;

//   try {

//     const purchased = await Purchase.find({ userId });

//     let purchasedCourseId = purchased.map((p) => p.courseId);

//     const courseData = await Course.find({ _id: { $in: purchasedCourseId } });

//     console.log(purchased, courseData);


//   } catch (error) {
//     console.log(error);

//   }

// }