var express = require("express");
var router = express.Router();
var helper = require("../helpers/default");
var mw = require("../utils/middleware");
var TaiKhoanModel = require("../models/taikhoan");
var KhoaModel = require("../models/khoa");
var BacSiModel = require("../models/bacsi");
var BenhNhanModel = require("../models/benhnhan");
var LichKhamBenhModel = require("../models/lichkhambenh");
var dateFormat = require('dateformat');

router.route("/")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'trangchu',
                title: "Trang chủ",
                User: dataUser[0]
            }
        });
    }]);

router.route("/benh-nhan")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'benhnhan',
                title: "Danh sách bệnh nhân",
                User: dataUser[0]
            }
        });
    }]);

router.route("/thong-tin/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'info',
                child: {
                    name: 'Danh sách bệnh nhân',
                    path: '/benh-nhan'
                },
                title: "Thông tin bệnh nhân",
                User: dataUser[0]
            }
        });
    }]);

router.route("/lich-kham")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var dslichkham;

        switch (dataUser[0].LoaiTK) {
            case 2:
                dslichkham = (req.query.startD && req.query.endD) ? await BacSiModel.filterLichKhamBenh(req.session.User.id, req.query.startD, req.query.endD)
                    : await BacSiModel.getLichKhamBenh(req.session.User.id);
                break;
            case 3:
                dslichkham = (req.query.startD && req.query.endD) ? await BenhNhanModel.filterLichKhamBenh(req.session.User.id, req.query.startD, req.query.endD)
                    : await BenhNhanModel.getLichKhamBenh(req.session.User.id);
                break;
            default:
                dslichkham = (req.query.startD && req.query.endD) ? await LichKhamBenhModel.filterLichKhamBenh(req.query.startD, req.query.endD)
                    : await LichKhamBenhModel.getLichKhamBenh();
                break;
        }

        dslichkham.forEach(item => {
            if (!item.ThoiGianPheDuyet && !item.ThoiGianHuyLich)
                item.TrangThai = "Chờ phê duyệt";
            else
                if (!item.ThoiGianDenKhamTT && !item.ThoiGianHoanThanh)
                    item.TrangThai = (item.ThoiGianPheDuyet && !item.ThoiGianHuyLich) ? "Đã phê duyệt" : "Đã hủy";
                else
                    if (item.SanSangKB == 0)
                        item.TrangThai = (item.ThoiGianDenKhamTT && !item.ThoiGianHoanThanh) ? "Chuẩn bị khám" : "Hoàn thành";
                    else
                        switch (item.SanSangKB) {
                            case 1:
                                item.TrangThai = "Bệnh nhân sẵn sàng"
                                break;
                            case 2:
                                item.TrangThai = "Đang khám bệnh"
                                break;
                        }
        });

        res.render("main", {
            data: {
                page: 'lichkham',
                title: "Lịch khám bệnh",
                User: dataUser[0],
                dslichkham: dslichkham
            }
        });
    }]);

router.route("/lich-kham/chi-tiet-lich-kham/:idlich")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        req.body.LKB[0].ThoiGianDatLich = (req.body.LKB[0].ThoiGianDatLich) ? dateFormat(new Date(req.body.LKB[0].ThoiGianDatLich), "yyyy-dd-mm hh:mm") : false;
        req.body.LKB[0].ThoiGianPheDuyet = (req.body.LKB[0].ThoiGianPheDuyet) ? dateFormat(new Date(req.body.LKB[0].ThoiGianPheDuyet), "yyyy-dd-mm hh:mm") : false;
        req.body.LKB[0].ThoiGianHuyLich = (req.body.LKB[0].ThoiGianHuyLich) ? dateFormat(new Date(req.body.LKB[0].ThoiGianHuyLich), "yyyy-dd-mm hh:mm") : false;
        req.body.LKB[0].ThoiGianKhamBenh = (req.body.LKB[0].ThoiGianKhamBenh) ? dateFormat(new Date(req.body.LKB[0].ThoiGianKhamBenh), "yyyy-dd-mm") : false;
        req.body.LKB[0].ThoiGianDenKhamTT = (req.body.LKB[0].ThoiGianDenKhamTT) ? dateFormat(new Date(req.body.LKB[0].ThoiGianDenKhamTT), "yyyy-dd-mm hh:mm") : false;
        req.body.LKB[0].ThoiGianHoanThanh = (req.body.LKB[0].ThoiGianHoanThanh) ? dateFormat(new Date(req.body.LKB[0].ThoiGianHoanThanh), "yyyy-dd-mm hh:mm") : false;

        if (!req.body.LKB[0].ThoiGianPheDuyet && !req.body.LKB[0].ThoiGianHuyLich)
            req.body.LKB[0].TrangThai = "Chờ phê duyệt";
        else
            if (!req.body.LKB[0].ThoiGianDenKhamTT && !req.body.LKB[0].ThoiGianHoanThanh)
                req.body.LKB[0].TrangThai = (req.body.LKB[0].ThoiGianPheDuyet && !req.body.LKB[0].ThoiGianHuyLich) ? "Đã phê duyệt" : "Đã hủy";
            else
                if (req.body.LKB[0].SanSangKB == 0)
                    req.body.LKB[0].TrangThai = (req.body.LKB[0].ThoiGianDenKhamTT && !req.body.LKB[0].ThoiGianHoanThanh) ? "Chuẩn bị khám" : "Hoàn thành";
                else
                    switch (req.body.LKB[0].SanSangKB) {
                        case 1:
                            req.body.LKB[0].TrangThai = "Bệnh nhân sẵn sàng"
                            break;
                        case 2:
                            req.body.LKB[0].TrangThai = "Đang khám bệnh"
                            break;
                    }

        var dsfile = await LichKhamBenhModel.getKQKhamBenh(req.params.idlich);

        dsfile.forEach(element => {
            element.ThoiGian = dateFormat(new Date(element.ThoiGian), "yyyy-dd-mm hh:mm");
        });

        var dsthuocdt = await LichKhamBenhModel.getThuocDT(req.params.idlich);

        res.render("main", {
            data: {
                page: 'ctlichkham',
                title: "Chi tiết lịch khám bệnh",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                chiTietLKB: req.body.LKB[0],
                dsfile: dsfile,
                dsthuocdt: dsthuocdt
            }
        });
    }]);

router.route("/lich-kham/phe-duyet")
    .post([async function (req, res) {
        try {
            if (req.body.pheDuyet == 1) {
                var datetime = new Date();
                var pheDuyet = await LichKhamBenhModel.pheDuyet(datetime, req.body.idlich);
                res.json({ status: 1 });
            }
            else {
                var datetime = new Date();
                var huyLich = await LichKhamBenhModel.huyLich(datetime, req.body.GhiChu, req.body.idlich);
                res.json({ status: 1 });
            }
        }
        catch (e) {
            console.log(e);
            res.json({ status: 0 });
        }
    }]);

router.route("/lich-kham/san-sang-kham-benh")
    .post([async function (req, res) {
        try {
            var status = await LichKhamBenhModel.getStatusLKB(req.body.IDLKB);
            if (status[0].SanSangKB == 1 || status[0].SanSangKB == 0) {
                var sanSang = await LichKhamBenhModel.sanSangKhamBenh(req.body.IDLKB, req.body.IDBN);

                if (sanSang.changedRows == 1)
                    res.json({ success: "Thành công" });
                else
                    res.json({ error: "Đã có lỗi xảy ra" });
            }
            else
                res.json({ error: "Đã có lỗi xảy ra" });
        }
        catch (e) {
            res.json({ error: "Đã có lỗi xảy ra" });
        }
    }]);

router.route("/ds-dieu-tri")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'dsdieutri',
                title: "Danh sách bệnh nhân điều trị",
                User: dataUser[0]
            }
        });
    }]);

router.route("/benh-nhan/:id/them-benh-dieu-tri")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'addbenhdieutri',
                child: {
                    name: 'Nguyễn Văn A',
                    path: '/thong-tin/10'
                },
                title: "Thêm bệnh điều trị",
                User: dataUser[0]
            }
        });
    }]);

router.route("/benh-nhan/:id/them-ke-hoach")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'themkehoach',
                child: {
                    name: 'Nguyễn Văn A',
                    path: '/thong-tin/10'
                },
                title: "Thêm kế hoạch điều trị",
                User: dataUser[0]
            }
        });
    }]);

router.route("/benh-nhan/:id/chi-tiet-ke-hoach")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'ctkehoach',
                child: {
                    name: 'Nguyễn Văn A',
                    path: '/thong-tin/10'
                },
                title: "Chi tiết kế hoạch điều trị",
                User: dataUser[0]
            }
        });
    }]);

router.route("/messenger")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'messenger',
                title: "Tin nhắn",
                User: dataUser[0]
            }
        });
    }]);

router.route("/messenger/chat/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'chat',
                child: {
                    name: 'Messenger',
                    path: '/messenger'
                },
                title: "Nhắn tin với anh A",
                User: dataUser[0]
            }
        });
    }]);

router.route("/messenger/videocall/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("videocall", {
            data: {
                title: "Nhắn tin với anh A",
                User: dataUser[0]
            }
        });
    }]);

router.route("/phong-kham")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res, next) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (dataUser[0].LoaiTK == 3)
            next();
        else {
            res.render("main", {
                data: {
                    page: 'phongkham-bs',
                    title: "Phòng khám",
                    User: dataUser[0],
                }
            });
        }
    }, async function (req, res, next) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (req.query.khoa)
            next();
        else {
            var khoa = await KhoaModel.getKhoa();
            res.render("main", {
                data: {
                    page: 'phongkham-bn',
                    title: "Chọn khoa để khám",
                    User: dataUser[0],
                    dskhoa: khoa
                }
            });
        }
    }, async function (req, res, next) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (req.query.bacsi)
            next();
        else {
            var bacsi = await BacSiModel.getBacSi(req.query.khoa);
            res.render("main", {
                data: {
                    page: 'chonbacsi',
                    title: "Chọn bác sĩ muốn khám",
                    User: dataUser[0],
                    dsbacsi: bacsi,
                    IDKhoa: req.query.khoa
                }
            });
        }
    }, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var infoBacsi = await BacSiModel.getInfoBacSi(req.query.bacsi);
        infoBacsi[0].NgaySinh = dateFormat(new Date(infoBacsi[0].NgaySinh), "dd/mm/yyyy");

        res.render("main", {
            data: {
                page: 'datlichkham',
                title: "Đặt lịch khám bệnh",
                User: dataUser[0],
                bacsi: infoBacsi[0]
            }
        });
    }])
    .post([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res, next) {
        if (req.body.IDKhungGio && req.body.BenhCanKham && req.body.TrieuChung && req.body.ThoiGianKhamBenh && req.body.HinhThuc)
            next();
        else {
            if (req.body.GetAjax && req.body.ThoiGianKhamBenh && req.body.HinhThuc != -1) {
                req.body.ThoiGianKhamBenh = dateFormat(new Date(req.body.ThoiGianKhamBenh), "yyyy-dd-mm");
                var khunggio = await LichKhamBenhModel.getKhungGioConCho(req.body.ThoiGianKhamBenh, req.body.HinhThuc);
                res.json(khunggio);
            }
            else
                res.redirect('back');
        }
    }, async function (req, res) {
        delete req.body.HinhThuc;

        req.body.IDBenhNhan = req.session.User.id;
        req.body.IDBacSi = req.query.bacsi;
        req.body.ThoiGianKhamBenh = dateFormat(new Date(req.body.ThoiGianKhamBenh), "yyyy-dd-mm");

        var result = await LichKhamBenhModel.checkKhungGio(req.body.ThoiGianKhamBenh, req.body.IDKhungGio);

        if (result[0].sl < result[0].MaxSL) {
            var datLich = await LichKhamBenhModel.addLich(req.body);
            res.redirect('/lich-kham');
        }
        else {
            res.send('<script>alert("Khung giờ này đã hết chỗ"); history.back();</script>');
        }
    }]);

router.route("/phong-kham/:id/lichkham")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'lichphongkham',
                title: "Lịch phòng khám",
                User: dataUser[0]
            }
        });
    }]);

router.route("/thanh-vien")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'thanhviengd',
                title: "Thành viên gia đình",
                User: dataUser[0]
            }
        });
    }]);

router.route("/ke-hoach-dieu-tri")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (req.query.user) {
            if (req.query.benh) {
                res.render("main", {
                    data: {
                        page: 'lichtrinhdt',
                        title: "Bệnh đang điều trị",
                        User: dataUser[0]
                    }
                });
            }
            else {
                res.render("main", {
                    data: {
                        page: 'benhdieutri',
                        title: "Bệnh đang điều trị",
                        User: dataUser[0]
                    }
                });
            }
        }
        else {
            res.render("main", {
                data: {
                    page: 'chontv',
                    title: "Kế hoạch điều trị",
                    path: 'ke-hoach-dieu-tri',
                    User: dataUser[0]
                }
            });
        }
    }]);
router.route("/chi-tiet-ke-hoach/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'ctkehoach',
                child: {
                    name: 'Nguyễn Văn A',
                    path: '/thong-tin/10'
                },
                title: "Chi tiết kế hoạch điều trị",
                User: dataUser[0]
            }
        });
    }]);
router.route("/ho-so-suc-khoe")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'hssuckhoe',
                title: "Hồ sơ sức khỏe",
                User: dataUser[0]
            }
        });
    }]);
router.route("/xac-nhan-lich-hen")
    .post(async function (req, res) {
        try {
            var qrText = req.body.qrText.split(":");
            var checkQRCode = await LichKhamBenhModel.checkQRCode(qrText[0], qrText[1]);

            if (checkQRCode[0])
                var updateLichKham = await LichKhamBenhModel.xacNhanDenKham(qrText[0]);

            if (updateLichKham.changedRows == 1)
                res.json({ success: "Xác nhận thành công" });
            else
                res.json({ error: "Đã xảy ra lỗi, xin mời thử lại" });
        }
        catch (e) {
            res.json({ error: "Đã xảy ra lỗi, xin mời thử lại" });
        }
    });
module.exports = router;