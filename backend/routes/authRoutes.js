const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



router.post('/register', async(req, res) => {

    try{
        const {username, email, password, phone, role} = req.body;

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({
                message : "User Already exists"
            })
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password : hashpassword,
            phone,
            role
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully"
        });
    }catch(err){
        res.status(500).json({
            message: err.message
        });
    }
})


router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message: "Invalid email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        res.json({
            message: "Login successful",
            token,
            user : {
                id : user._id,
                username : user.username,
                email : user.email,
                role : user.role
            }
        });

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

module.exports = router;