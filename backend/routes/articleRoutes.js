const express = require("express");

const {
    getNews
} = require("../controllers/articleController");

const router =
    express.Router();


router.get(
    "/",
    getNews
);


module.exports =
    router;