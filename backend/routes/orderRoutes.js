const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const Order = require("../models/Order");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { 
        items, 
        totalAmount, 
        pickupAddress, 
        pickupDate, 
        paymentMethod } = req.body;

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      pickupAddress,
      pickupDate,
      paymentMethod,
    });

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


router.get("/my-orders", authMiddleware, async(req, res) => {
    try{
        const orders = await Order.find({
            user : req.user.id
        }).sort({createdAt : -1})
        res.json(orders);
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
});


router.get(
  "/pending",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find({
        orderStatus: "Pending"
      }).populate(
        "user",
        "username phone"
      );

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


router.put(
  "/accept/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      order.partner = req.user.id;
      order.orderStatus = "Assigned";

      await order.save();

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


router.get(
  "/partner-orders",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find({
        partner: req.user.id
      })
      .populate(
        "user",
        "username phone"
      )
      .sort({
        createdAt: -1
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


router.put(
  "/status/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      order.orderStatus = status;

      await order.save();

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


router.put(
  "/cancel/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Make sure user owns the order
      if (
        order.user.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      // Allowed only before pickup
      if (
        order.orderStatus !== "Pending" &&
        order.orderStatus !== "Assigned"
      ) {
        return res.status(400).json({
          message:
            "Order cannot be cancelled after pickup",
        });
      }

      order.orderStatus =
        "Cancelled";

      await order.save();

      res.json({
        message:
          "Order cancelled successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router
