var express = require("express");
var router = express.Router();
var DoiTacModel = require("../models/doitac");
var dateFormat = require('dateformat');
var decode = require('decode-html');

router.route("/")
    .post(async function (req, res) {
        var doitac = req.body;
        try {
            let dsDoiTac = await DoiTacModel.getDsDoiTac(doitac.linhvuc).then((data) => data);
            let dsDoiTacVaChiNhanh = await Promise.all(dsDoiTac.map(async (item) => {
                let dsLinhVucKinhDoanh = await DoiTacModel.getLinhVucKinhDoanh(item.ID_DoiTac)
                let anhDaiDien = await DoiTacModel.getHinhAnh(item.ID_DoiTac, 2)
                let dsChiNhanh = await DoiTacModel.getDsChiNhanh(item.ID_DoiTac)
                let dsChiNhanhVaDanhGia = await Promise.all(dsChiNhanh.map(async (item) => {
                    let diem = await DoiTacModel.getDiemDanhGia(item.ID_ChiNhanh)
                    return ({
                        ...item,
                        Diem: (diem[0].Diem === null) ? 0 : diem[0].Diem
                    })
                }));

                return ({
                    ...item,
                    AnhDaiDien: anhDaiDien,
                    LinhVucKinhDoanh: dsLinhVucKinhDoanh,
                    ChiNhanh: dsChiNhanhVaDanhGia
                })
            })).then(data => data);

            res.json(dsDoiTacVaChiNhanh);
        }
        catch (e) {
            res.json({ "Messenger": e });
        }

    });
router.route("/dichvu")
    .post(function (req, res) {
        var data = req.body;
        try {
            var result = DoiTacModel.getDichVu(data.idChiNhanh);
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
router.route("/uudai")
    .post(function (req, res) {
        var data = req.body;
        try {
            var result = DoiTacModel.getUuDai(data.idDoiTac);
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
router.route("/danhgia")
    .post(function (req, res) {
        var data = req.body;
        try {
            var result = DoiTacModel.getDanhGia(data.idChiNhanh);
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

router.route("/chitietdichvu/:id")
    .get(function (req, res) {
        try {
            var result = DoiTacModel.getChiTietDichVu(req.params.id);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (dt) {
                    dt[0].MoTa=decode(dt[0].MoTa);
                    res.render("chitietdichvu", {
                        NoiDung: dt[0].MoTa,
                        TenDichVu: dt[0].TenDichVu
                    });
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.route("/chitietuudai/:id")
    .get(function (req, res) {
        try {
            var result = DoiTacModel.getChiTietUuDai(req.params.id);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (dt) {
                    var batDau = dateFormat(new Date(dt[0].TgBatDau), "dd/mm/yyyy");
                    var ketThuc = dateFormat(new Date(dt[0].TgKetThuc), "dd/mm/yyyy");
                    res.render("chitietuudai", {
                        NoiDung: dt[0].NoiDungUuDai.replace(/(\r\n|\n|\r)/gm, "").trim(),
                        BatDau: batDau,
                        KetThuc: ketThuc,
                        TenUuDai: dt[0].TenUuDai
                    });
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.route("/danh-sach-yeu-cau")
    .post(async function (req, res) {
        var { ID_TaiKhoan, TrangThai } = req.body;

        try {
            var result = await DoiTacModel.dsYeuCauCuuHo(ID_TaiKhoan, TrangThai).then((data) => data);
            res.json(result);
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.route("/chi-tiet-yeu-cau")
    .post(async function (req, res) {
        var { ID_YeuCau } = req.body;

        try {
            var result = await DoiTacModel.getChiTietYeuCau(ID_YeuCau).then((data) => data);
            res.json(result);
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
module.exports = router;

