var express = require("express");
var router = express.Router();
var helper = require("../helpers/default");
var HeThongModel = require("../models/hethong");
var DoiTacModel = require("../models/doitac");
var TaiKhoanModel = require("../models/user");
var dateFormat = require('dateformat');
var date = new Date(), base_url = "admin.cuuhoxedn.net";;


function dieuHuong(req, res) {
    if (!helper.kiemTraDangNhap(req))
        res.redirect('/account');
}
router.route("/")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var thongTinHeThong = await HeThongModel.getThongTinHeThong();

        res.render("admin", {
            data: {
                page: "home",
                tieude: "Bảng điều khiển | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Bảng điều khiển",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path
            }
        });
    });
router.route("/doi-tac")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var slDoiTac = await DoiTacModel.getSlDoiTac();
            var start = 0;
            var limit = 10;
            var tongSoTrang = Math.ceil(slDoiTac[0].sl / limit);
            var dsDoiTac = await DoiTacModel.getDsDoiTacAll(start, limit);
            dsDoiTac.forEach(element => {
                element.NgayHoatDong = dateFormat(new Date(element.NgayHoatDong), "dd/mm/yyyy");
            });
            console.log(req.session.PheDuyet);
            if (req.session.PheDuyet) {
                var error = req.session.PheDuyet.error;
                var success = req.session.PheDuyet.success;
                req.session.PheDuyet = {
                    success: false,
                    error: false
                }
            }
            else {
                var error = false;
                var success = false;
            }
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "doitac",
                tieude: "Quản lí đối tác | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí đối tác",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsDoiTac: dsDoiTac,
                tongSoTrang: tongSoTrang,
                trangHT: 1,
                error: error,
                success: success
            }
        });
    });
router.route("/tim-kiem-doi-tac")
    .post(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var dsDoiTac = await DoiTacModel.timKiemDoiTac(req.body.q);
            dsDoiTac.forEach(element => {
                element.NgayHoatDong = dateFormat(new Date(element.NgayHoatDong), "dd/mm/yyyy");
            });
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "doitac",
                tieude: "Quản lí đối tác | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí đối tác",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsDoiTac: dsDoiTac,
            }
        });
    });
router.route("/doi-tac/:page")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var slDoiTac = await DoiTacModel.getSlDoiTac();

            var limit = 10;
            var start = (req.params.page == 1) ? 0 : ((req.params.page - 2) + limit);
            var tongSoTrang = Math.ceil(slDoiTac[0].sl / limit);
            if (req.params.page < 1 || req.params.page > tongSoTrang)
                res.status(404).json("Yêu cầu không hợp lệ");
            var dsDoiTac = await DoiTacModel.getDsDoiTacAll(start, limit);
            dsDoiTac.forEach(element => {
                element.NgayHoatDong = dateFormat(new Date(element.NgayHoatDong), "dd/mm/yyyy");
            });
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "doitac",
                tieude: "Quản lí đối tác | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí đối tác",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsDoiTac: dsDoiTac,
                tongSoTrang: tongSoTrang,
                trangHT: req.params.page
            }
        });
    });
router.route("/doi-tac/:id/pheduyet")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var kq = await DoiTacModel.setTrangThaiDoiTac(1, req.params.id);
        var idTK = await DoiTacModel.getChiTietDoiTac(req.params.id);
        var pheDuyet = await TaiKhoanModel.voHieuHoaTaiKhoan(idTK[0].IDTK, true);
        res.redirect("/doi-tac");
    });
router.route("/doi-tac/:id/tuchoi")
    .get(function (req, res) {
        dieuHuong(req, res);
        var kq = DoiTacModel.setTrangThaiDoiTac(-1, req.params.id);
        if (!kq) {
            req.session.PheDuyet = {
                error: "Yêu cầu không hợp lệ",
                success: false
            }
        }
        else {
            kq.then(data => {
                req.session.PheDuyet = {
                    success: "Từ Chối Phê Duyệt Thành Công",
                    error: false
                }
            }).catch(err => {
                req.session.PheDuyet = {
                    error: "Có lỗi xảy ra",
                    success: false
                }
            });
        }
        res.redirect("/doi-tac");
    });
router.route("/doi-tac/:id/xoa")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var xoaDT = await DoiTacModel.setTrangThaiDoiTac(-2, req.params.id);
        var idTK = await DoiTacModel.getChiTietDoiTac(req.params.id);
        var xoaTK = await TaiKhoanModel.voHieuHoaTaiKhoan(idTK[0].IDTK, false);
        res.redirect("/doi-tac");
    });

router.route("/tai-khoan")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var slTaiKhoan = await TaiKhoanModel.getSlTaiKhoan();
            var start = 0;
            var limit = 10;
            var tongSoTrang = Math.ceil(slTaiKhoan[0].sl / limit);
            var dsTaiKhoan = await TaiKhoanModel.getDSTaiKhoan(start, limit);

        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "taikhoan",
                tieude: "Quản lí tài khoản | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí tài khoản",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsTaiKhoan: dsTaiKhoan,
                tongSoTrang: tongSoTrang,
                trangHT: 1,
            }
        });
    });
router.route("/tim-kiem-tai-khoan")
    .post(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var dsTaiKhoan = await TaiKhoanModel.timKiemTaiKhoan(req.body.q);
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "taikhoan",
                tieude: "Quản lí đối tác | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí đối tác",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsTaiKhoan: dsTaiKhoan,
            }
        });
    });
router.route("/tai-khoan/:page")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var slTaiKhoan = await TaiKhoanModel.getSlTaiKhoan();

            var limit = 10;
            var start = (req.params.page == 1) ? 0 : ((req.params.page - 2) + limit);
            var tongSoTrang = Math.ceil(slTaiKhoan[0].sl / limit);
            if (req.params.page < 1 || req.params.page > tongSoTrang)
                res.status(404).json("Yêu cầu không hợp lệ");
            var dsTaiKhoan = await TaiKhoanModel.getDSTaiKhoan(start, limit);
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "taikhoan",
                tieude: "Quản lí tài khoản | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Quản lí tài khoản",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                dsTaiKhoan: dsTaiKhoan,
                tongSoTrang: tongSoTrang,
                trangHT: req.params.page
            }
        });
    });
router.route("/tai-khoan/:id/xoa")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var xoaTK = await TaiKhoanModel.voHieuHoaTaiKhoan(req.params.id, false);
        res.redirect("back");
    });
router.route("/tai-khoan/:id/chinhsua")
    .get(async function (req, res, next) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var taikhoan = await TaiKhoanModel.getChiTietTaiKhoan(req.params.id);
            taikhoan[0].NgaySinh = dateFormat(new Date(taikhoan[0].NgaySinh), "yyyy-mm-dd");

            var chiNhanh = false;
            if (taikhoan[0].LoaiTK == 2)
                chiNhanh = await TaiKhoanModel.cttkNhanVien(req.params.id);
            taikhoan = {
                ...taikhoan[0],
                ChiNhanh: chiNhanh[0]
            }
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "chinhsuataikhoan",
                tieude: "Chỉnh sửa tài khoản | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Chỉnh sửa tài khoản",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                mapApi: thongTinHeThong[0].GoogleMapApi,
                taikhoan: taikhoan
            }
        });
    })
    .post(helper.uploadAnh().fields([{ name: 'fileCMNDT', maxCount: 1 }, { name: 'fileCMNDS', maxCount: 1 }, { name: 'fileAvatar', maxCount: 1 }]), async function (req, res) {
        let file = req.files;
        delete req.body.TenDangNhap;

        req.body.AnhMatTruocCMND = (file.fileCMNDT) ? 'https://' + base_url + '/static/img/' + file.fileCMNDT[0].filename : req.body.urlSCMND;
        req.body.AnhMatSauCMND = (file.fileCMNDS) ? 'https://' + base_url + '/static/img/' + file.fileCMNDS[0].filename : req.body.urlTCMND;
        req.body.HinhDaiDien = (file.fileAvatar) ? 'https://' + base_url + '/static/img/' + file.fileAvatar[0].filename : req.body.urlAnhDaiDien;

        delete req.body.urlSCMND;
        delete req.body.urlTCMND;
        delete req.body.urlAnhDaiDien;

        let upload = await TaiKhoanModel.updateUser(req.params.id, req.body);

        res.redirect("back");

    });
router.route("/yeu-cau-cuu-ho")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var yeuCauCuuHo = await DoiTacModel.getYeuCauCuuHo();
            yeuCauCuuHo.forEach(element => {
                element.ThoiGianNgan = dateFormat(new Date(element.ThoiGian), "dd/mm/yyyy");
            });
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "yeucaucuuho",
                tieude: "Yêu cầu cứu hộ | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Yêu cầu cứu hộ",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                mapApi: thongTinHeThong[0].GoogleMapApi,
                yeuCauCuuHo: yeuCauCuuHo
            }
        });
    });
router.route("/yeu-cau-cuu-ho/:id/chitiet")
    .get(async function (req, res) {
        dieuHuong(req, res);
        try {
            var thongTinHeThong = await HeThongModel.getThongTinHeThong();
            var yeuCauCuuHo = await DoiTacModel.getChiTietYeuCauCuuHo(req.params.id);
            yeuCauCuuHo[0].ThoiGianNgan = dateFormat(new Date(yeuCauCuuHo[0].ThoiGian), "dd/mm/yyyy");
        }
        catch (e) {
            res.json(e.toString());
        }
        res.render("admin", {
            data: {
                page: "chitietyeucau",
                tieude: "Chi tiết yêu cầu cứu hộ | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Chi tiết yêu cầu cứu hộ",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                mapApi: thongTinHeThong[0].GoogleMapApi,
                yeuCauCuuHo: yeuCauCuuHo[0]
            }
        });
    });
router.route("/yeu-cau-cuu-ho/:id/xoa")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var xoaHA = await DoiTacModel.xoaHinhAnhCuuHo(req.params.id);
        var xoaYC = await DoiTacModel.xoaYeuCauCuuHo(req.params.id);

        res.redirect("back");
    });
router.route("/cai-dat")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var thongTinHeThong = await HeThongModel.getThongTinHeThong();
        res.render("admin", {
            data: {
                page: "caidat",
                tieude: "Cài đặt hệ thống | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Cài đặt hệ thống",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path,
                mapApi: thongTinHeThong[0].GoogleMapApi
            }
        });
    })
    .post(helper.uploadAnh().fields([{ name: 'fileLogo', maxCount: 1 }, { name: 'fileFavicon', maxCount: 1 }]), async function (req, res) {
        let file = req.files;

        req.body.Logo = (file.fileLogo) ? 'https://' + base_url + '/static/img/' + file.fileLogo[0].filename : req.body.urlLogo;
        req.body.Favicon = (file.fileFavicon) ? 'https://' + base_url + '/static/img/' + file.fileFavicon[0].filename : req.body.urlFavicon;

        delete req.body.urlLogo;
        delete req.body.urlFavicon;

        var cn = await TaiKhoanModel.updateHeThong(req.body);

        res.redirect("back");
    });
router.route("/recovery")
    .get(async function (req, res) {
        dieuHuong(req, res);
        var thongTinHeThong = await HeThongModel.getThongTinHeThong();
        res.render("admin", {
            data: {
                page: "home",
                tieude: "Sao lưu và khôi phục | Hệ thống cứu hộ xe cơ giới tại Đà Nẵng",
                web_title: "Sao lưu và khôi phục",
                year: date.getFullYear(),
                base_url: base_url,
                info: thongTinHeThong[0],
                name: req.route.path
            }
        });
    });

module.exports = router;