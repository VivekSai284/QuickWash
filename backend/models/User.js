const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type :String,
            required: true,
        },
        email: {
            type :String,
            required: true,
            unique: true
        },
        password: {
            type :String,
            required: true,
        },
        phone: {
            type :Number,
            required: true,
        },
        role: {
            type :String,
            required: true,
            enum: ['user', 'partner', 'admin'],
            default: 'user'
        }
    },{
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema);