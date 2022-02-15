var express = require("express");
var router = express.Router();


router.use("/", require(__dirname + "/nguoidung"));

router.use("/account", require(__dirname + "/account"));

router.use("/api", require(__dirname + "/api"));

module.exports = router;

