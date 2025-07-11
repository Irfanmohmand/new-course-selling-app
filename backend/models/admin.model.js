import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  // We want to give a clean, friendly error message, instead of a raw MongoDB duplicate key error.
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
});

export const Admin = mongoose.model("Admin", adminSchema);