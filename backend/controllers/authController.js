const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/* =====================================================
   SIGNUP
   ===================================================== */

const signup = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            state,
            district,
            city,
            languages,
            interests,
            preferences
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });

        }


        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await User.create({

                name,

                email:
                    email.toLowerCase(),

                password:
                    hashedPassword,

                state:
                    state || "",

                district:
                    district || "",

                city:
                    city || "",

                languages:
                    Array.isArray(languages) &&
                    languages.length
                        ? languages
                        : ["English"],

                interests:
                    Array.isArray(interests) &&
                    interests.length
                        ? interests
                        : [
                            "world",
                            "india",
                            "local"
                        ],

                preferences:
                    Array.isArray(preferences)
                        ? preferences
                        : []

            });


        const token =
            jwt.sign(

                {
                    userId:
                        user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        res.status(201).json({

            message:
                "Signup successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                state:
                    user.state,

                district:
                    user.district,

                city:
                    user.city,

                languages:
                    user.languages,

                interests:
                    user.interests,

                preferences:
                    user.preferences

            }

        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        res.status(500).json({
            message:
                "Server error during signup"
        });

    }

};


/* =====================================================
   LOGIN
   ===================================================== */

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        const user =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const token =
            jwt.sign(

                {
                    userId:
                        user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        res.json({

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                state:
                    user.state,

                district:
                    user.district,

                city:
                    user.city,

                languages:
                    user.languages,

                interests:
                    user.interests,

                preferences:
                    user.preferences

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message:
                "Server error during login"
        });

    }

};


/* =====================================================
   GET PROFILE
   ===================================================== */

const getProfile = async (req, res) => {

    try {

        const user =
            await User.findById(
                req.userId
            ).select("-password");


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        res.json({
            user
        });


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load profile"
        });

    }

};


/* =====================================================
   UPDATE PROFILE
   ===================================================== */

const updateProfile = async (req, res) => {

    try {

        const {
            name,
            languages,
            state,
            district,
            city
        } = req.body;


        const user =
            await User.findById(
                req.userId
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        /* NAME */

        if (
            typeof name === "string" &&
            name.trim()
        ) {

            user.name =
                name.trim();

        }


        /* LANGUAGE */

        if (
            Array.isArray(languages)
        ) {

            user.languages =
                languages;

        }


        /* LOCATION */

        if (
            typeof state === "string"
        ) {

            user.state =
                state.trim();

        }


        if (
            typeof district === "string"
        ) {

            user.district =
                district.trim();

        }


        if (
            typeof city === "string"
        ) {

            user.city =
                city.trim();

        }


        await user.save();


        const updatedUser =
            await User.findById(
                user._id
            ).select("-password");


        res.json({

            message:
                "Profile updated successfully",

            user:
                updatedUser

        });


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to update profile"
        });

    }

};


/* =====================================================
   EXPORT
   ===================================================== */

module.exports = {

    signup,
    login,
    getProfile,
    updateProfile

};