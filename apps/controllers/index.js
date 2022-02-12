var express = require("express");
var router = express.Router();


router.use("/",require(__dirname + "/nguoidung"));

router.use("/account",require(__dirname + "/account"));

module.exports = router;

