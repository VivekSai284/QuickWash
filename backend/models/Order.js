const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        user: {
            type : mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },

        items:[
            {
                itemId : {
                    type: mongoose.Schema.Types.ObjectId,
                    ref : "LaundryItems",
                },

                name : String,
                price: Number,
                quantity: Number,
            },
        ],

        totalAmount : {
            type : Number,
            required:true,
        },
        pickupAddress: {
            type: String,
            required: true
        },
        pickupDate: {
            type : Date,
            required: true
        },
        paymentMethod: {
            type: String,
            enum : ["COD", "ONLINE"],
            default : "COD"
        },
        paymentStatus : {
            type : String,
            enum : ["Pending", "Paid"],
            default : "Pending"
        },
        orderStatus: {
            type: String,
            enum : [
                "Pending",
                "Assigned",
                "Cancelled",
                "Picked Up",
                "Washing",
                "Out For Delivery",
                "Delivered"
            ],
            default: "Pending"
        },
        partner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null
        },
    },{
        timestamps: true
    }
)


module.exports = mongoose.model("Order", orderSchema);