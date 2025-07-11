import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary"
import { Purchase } from "../models/purchase.model.js";

// create course
export const createCourse = async (req, res) => {
  const { adminId } = req;
  const { title, description, price } = req.body;

  try {

    if (!title || !description || !price) {
      return res.status(400).json({
        errors: "All fields are required."
      });
    };

    const { image } = req.files;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        errors: "No files uploaded"
      });
    };

    const allowedFormat = ["image/jpeg", "image/png"];

    if (!allowedFormat.includes(image.mimetype)) {
      return res.status(400).json({
        errors: "Invalid file format. Only JPG and PNG are allowed."
      });
    };

    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);

    if (!cloud_response || cloud_response.error) {
      return res.status(400).json({
        errors: "Error uploading file to cloudinary."
      });
    };


    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.url
      },
      creatorId: adminId
    };

    const course = await Course.create(courseData);

    res.status(200).json({
      message: "Course created successfully.",
      course
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: "Error creating course."
    })
  }
};

// You need the updated document	findByIdAndUpdate
// You just want to update silently	updateOne

// update course
export const updateCourse = async (req, res) => {
  const { adminId } = req;
  const { courseId } = req.params;
  const { title, description, price } = req.body;

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required." });
    }

    const updatedData = {
      title,
      description,
      price
    };

    if (req.files && req.files.image) {
      const image = req.files.image;

      const allowedFormat = ["image/jpeg", "image/png"];
      if (!allowedFormat.includes(image.mimetype)) {
        return res.status(400).json({ errors: "Invalid file format." });
      }

      const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
      if (!cloudResponse || cloudResponse.error) {
        return res.status(500).json({ errors: "Failed to upload image." });
      }

      updatedData.image = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.url
      };
    }

    await Course.updateOne(
      { _id: courseId, creatorId: adminId },
      updatedData
    );

    res.status(200).json({ message: "Course updated successfully." });

  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ errors: "Error updating course." });
  }
};





// delete course
export const deleteCourse = async (req, res) => {
  const { adminId } = req;
  const { courseId } = req.params;

  try {

    const course = await Course.findByIdAndDelete({ _id: courseId, creatorId: adminId });

    if (!course) {
      return res.status(404).json({
        errors: "Course not found."
      });
    };

    res.status(200).json({
      message: "Course deleted successfully."
    })

  } catch (error) {
    res.status(500).json({
      errors: "Error in course deleting."
    });
    console.log("Error in course deleting", error);

  }
}



// get all course
export const getCourses = async (req, res) => {
  try {

    const courses = await Course.find();

    return res.status(201).json({
      courses
    });

  } catch (error) {
    console.log("Error in getting courses.");
    return res.status(500).json({
      errors: "Error in getting courses."
    })
  }
};



// get course details
export const courseDetails = async (req, res) => {
  const { courseId } = req.params;

  try {

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        errors: "Course not found."
      });
    }

    return res.status(200).json({
      course
    });

  } catch (error) {
    console.log("Error in getting course details.", error);
    return res.status(500).json({
      errors: "Error in getting course details."
    });
  };
};


import Stripe from "stripe"
import config from "../config.js";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// console.log(config.STRIPE_SECRET_KEY);

// buy course 
export const buyCourse = async (req, res) => {

  const { userId } = req;
  const { courseId } = req.params;

  try {

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: "Course not found."
      })
    };


    const existingPurchase = await Purchase.findOne({ userId, courseId });

    if (existingPurchase) {
      return res.status(400).json({
        errors: "User has already puchased this course."
      });
    };

    // stripe payment method
    const amount = course.price;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: { //Tells Stripe to allow card, Apple Pay, Google Pay, etc. automatically
        enabled: true
      }
    });

    const newPurchase = new Purchase({
      userId,
      courseId
    });


    return res.status(201).json({
      message: "Course purchased successfully.",
      course,
      clientSecret: paymentIntent.client_secret,
    });



  } catch (error) {
    console.log("Error in buying course.");
    return res.status(500).json({
      errors: "Error in buying course."
    })
  }

}