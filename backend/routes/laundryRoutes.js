const express = require("express");
const LaundryItems = require("../models/LaundryItems");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await LaundryItems.find()
    res.json(items)
  } catch (err) {
    res.status(500).json({
        message : error.message,
        
    })
  }
});

module.exports = router;
