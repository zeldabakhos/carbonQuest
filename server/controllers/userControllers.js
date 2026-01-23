const User = require("../models/userModels.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    console.log("Password received from frontend:", password);

    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            console.log("User not found");
            throw new Error("Invalid credentials");
        }
        console.log("User found:", foundUser.email);

        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        console.log("Password match:", passwordMatch);
        if (!passwordMatch) {
            console.log("Password incorrect");
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            {
                userId: foundUser._id,
            },
            process.env.SECRET_TOKEN_KEY,
            { expiresIn: "24h" }
        );

        res.status(200).json({ 
            token,
            imageUrl: foundUser.imageUrl || null,
            firstName: foundUser.firstName,
            role: foundUser.role
        });
        
    } catch (err) {
        console.log("Login error:", err.message);
        res.status(401).json({
            message: err.message,
        });
    }
};


exports.userSignUp = async (req, res) => {
    const { firstName, email, lastName, role } = req.body;
    const hashedPassword = req.hashedPassword;

    // Only save the RELATIVE PATH (no protocol/domain)
    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;
  
    try {
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            imageUrl,
            role,
            inventory: [],
        });

        const savedUser = await newUser.save();
        res.status(201).json({
            firstName: savedUser.firstName,
            email: savedUser.email,
            role: savedUser.role,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};
