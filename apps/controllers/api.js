var express = require("express");
var router = express.Router();
var helper = require("../helpers/default");
var LichKhamBenhModel = require("../models/lichkhambenh");
var BenhNhanModel = require("../models/benhnhan");
var dateFormat = require('dateformat');

router.route("/upload-file")
    .post(helper.uploadFile().fields([{ name: 'fileKetQua', maxCount: 1 }]), async function (req, res) {
        try {
            let file = req.files;
            var IDLKB = req.body.IDLKB;

            req.body.TenFile = file.fileKetQua[0].filename;
            req.body.DuongDan = '/static/files/' + file.fileKetQua[0].filename;
            delete req.body.IDLKB;

            var addKQ = await LichKhamBenhModel.addKQKB(req.body);
            if (addKQ.affectedRows) {
                var IDKQ = addKQ.insertId;
                var data = {
                    IDKetQuaKB: IDKQ,
                    IDLKB: IDLKB
                }

                var addCTKQ = await LichKhamBenhModel.addChiTietKQ(data);
                if (addCTKQ.affectedRows)
                    res.json({
                        success: "Thành công",
                        data: {
                            TenFile: req.body.TenFile,
                            DuongDan: req.body.DuongDan,
                            ThoiGian: new Date(),
                            GhiChu: req.body.GhiChu
                        }
                    });
                else
                    res.json({ error: "Upload file thất bại" });
            }
        }
        catch (e) {
            res.json({ error: e });
        }
    });
router.route("/tim-thuoc")
    .get(async function (req, res) {
        var thuoc = await LichKhamBenhModel.timThuoc(req.query.q);
        res.json(thuoc);
    });
router.route("/them-thuoc-dieu-tri")
    .post(async function (req, res) {
        var themThuoc = await LichKhamBenhModel.themThuocDieuTri(req.body);
        if (themThuoc.affectedRows)
            res.json({
                success: "Thành công",
                data: {
                    ...req.body,
                    Thuoc: await LichKhamBenhModel.getCTThuoc(req.body.IDThuoc)
                }
            });
        else
            res.json({ error: "Có lỗi xảy ra" });
    });
router.route("/tim-benh")
    .get(async function (req, res) {
        var thuoc = await LichKhamBenhModel.timBenh(req.query.q);
        res.json(thuoc);
    });

router.route("/ds-ke-hoach")
    .post(async function (req, res) {
        var KH = await BenhNhanModel.getKHBenh(req.body.IDBN,req.body.IDBenh);
        res.json(KH);
    });
module.exports = router;