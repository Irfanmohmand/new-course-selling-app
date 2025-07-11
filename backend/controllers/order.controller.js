// controllers/order.controller.js
import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";

export const orderData = async (req, res) => {
  const order = req.body;

  try {
    const orderInfo = await Order.create(order); // ✅ use `order`, not `orderInfo`

    const userId = orderInfo?.userId;
    const courseId = orderInfo?.courseId;

    if (orderInfo) {
      await Purchase.create({ userId, courseId });
    }

    res.status(201).json({
      message: "Order created successfully.",
      orderInfo
    });

  } catch (error) {
    console.log("Error in order", error);
    res.status(401).json({
      errors: "Error in order creation."
    });
  }
};
