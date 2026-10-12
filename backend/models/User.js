const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // =========================
        // BASIC USER DETAILS
        // =========================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },


        // =========================
        // LOCATION
        // =========================

        state: {
            type: String,
            default: ""
        },

        district: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },


        // =========================
        // LANGUAGE PREFERENCES
        // =========================

        languages: {
            type: [String],
            default: ["English"]
        },


        // =========================
        // NEWS INTERESTS
        // =========================

        interests: {
            type: [String],
            default: [
                "world",
                "india",
                "local"
            ]
        },


        // =========================
        // OLD PREFERENCES FIELD
        // KEPT FOR COMPATIBILITY
        // =========================

        preferences: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model("User", userSchema);