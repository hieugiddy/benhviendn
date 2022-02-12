var express = require("express");
var router = express.Router();
var HeThongModel = require("../models/hethong");

router.route("/")
    .get(function (req, res) {
        try {
            var result = HeThongModel.getThongTinHeThong();
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (dt) {
                    res.json(dt);
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
module.exports = router;

