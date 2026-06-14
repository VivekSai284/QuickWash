const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.countDocuments({
        role: "user",
      });

      const partners = await User.countDocuments({
        role: "partner",
      });

      const orders = await Order.countDocuments();

      const pending = await Order.countDocuments({
        orderStatus: "Pending",
      });

      const assigned = await Order.countDocuments({
        orderStatus: "Assigned",
      });

      const pickedUp = await Order.countDocuments({
        orderStatus: "Picked Up",
      });

      const washing = await Order.countDocuments({
        orderStatus: "Washing",
      });

      const outForDelivery =
        await Order.countDocuments({
          orderStatus: "Out For Delivery",
        });

      const delivered =
        await Order.countDocuments({
          orderStatus: "Delivered",
        });

      const cancelled =
        await Order.countDocuments({
          orderStatus: "Cancelled",
        });

      const revenueData = await Order.find({
        orderStatus: "Delivered",
      });

      const revenue = revenueData.reduce(
        (sum, order) =>
          sum + order.totalAmount,
        0
      );

      const recentOrders = await Order.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        users,
        partners,
        orders,
        revenue,

        pending,
        assigned,
        pickedUp,
        washing,
        outForDelivery,
        delivered,
        cancelled,

        recentOrders,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const users = await User.find().select(
      "-password"
    );

    res.json(users);
  }
);

router.get(
  "/top-partners",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const partners = await User.find({
        role: "partner",
      }).select("username email");

      const result = await Promise.all(
        partners.map(async (partner) => {
          const deliveries =
            await Order.countDocuments({
              partner: partner._id,
              orderStatus: "Delivered",
            });

          return {
            ...partner.toObject(),
            deliveries,
          };
        })
      );

      result.sort(
        (a, b) =>
          b.deliveries - a.deliveries
      );

      res.json(result.slice(0, 5));
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);


router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.get(
  "/partners",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const partners =
        await User.find({
          role: "partner",
        }).select(
          "-password"
        );

      res.json(
        partners
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate(
          "user",
          "username email phone"
        )
        .populate(
          "partner",
          "username email phone"
        )
        .sort({
          createdAt: -1,
        });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;