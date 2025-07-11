import config from "../config.js";
import jwt from "jsonwebtoken";

export const adminMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      errors: "No token provided."
    });
  };

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    req.adminId = decoded.id;
    console.log(decoded.id);

    next();

  } catch (error) {
    console.log("Invalid token or expired.", error);

  }

};