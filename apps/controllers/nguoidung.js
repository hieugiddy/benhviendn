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
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
            }
        });
    }]);

router.route("/benh-nhan")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var BN = await BenhNhanModel.getDSBenhNhan();
        res.render("main", {
            data: {
                page: 'benhnhan',
                title: "Danh sách bệnh nhân",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                BN: BN
            }
        });
    }]);

router.route("/thong-tin/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var getTK = await TaiKhoanModel.getChiTietTaiKhoan(req.params.id);
        getTK[0].NgaySinh=dateFormat(new Date(getTK[0].NgaySinh), "dd-mm-yyyy");

        var getBN = await TaiKhoanModel.getChiTietBN(req.params.id);
        var getDSBenh= await BenhNhanModel.getDSBenh(req.params.id);
        
        res.render("main", {
            data: {
                page: 'info',
                child: {
                    name: 'Danh sách bệnh nhân',
                    path: '/benh-nhan'
                },
                title: "Thông tin bệnh nhân",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                TK: {
                    ...getTK[0],
                    ID: req.params.id
                },
                BN: getBN[0],
                Benh: getDSBenh
            }
        });
    }]);

router.route("/lich-kham")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res, next) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var dslichkham;

        switch (dataUser[0].LoaiTK) {
            case 2:
                dslichkham = (req.query.startD && req.query.endD) ? await BacSiModel.filterLichKhamBenh(req.session.User.id, req.query.startD, req.query.endD)
                    : await BacSiModel.getLichKhamBenh(req.session.User.id);
                break;
            case 3:
                return next();
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
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                dslichkham: dslichkham
            }
        });
    }, async function (req, res, next) {
        if (req.query.user)
            next();
        else {
            var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
            var tvSSK = await TaiKhoanModel.getSSK(dataUser[0].Username);

            res.render("main", {
                data: {
                    page: 'chontv',
                    title: "Lịch khám bệnh",
                    path: 'lich-kham',
                    User: {
                        ...dataUser[0],
                        ID: req.session.User.id
                    },
                    TV: tvSSK
                }
            });
        }
    }, async function (req, res, next) {
        var dslichkham = (req.query.startD && req.query.endD) ? await BenhNhanModel.filterLichKhamBenh(req.session.User.id, req.query.startD, req.query.endD)
            : await BenhNhanModel.getLichKhamBenh(req.query.user);
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

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
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
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

router.route("/lich-kham/hoan-thanh-kham-benh")
    .post([async function (req, res) {
        try {
            var result = await LichKhamBenhModel.hoanThanhLichKham(req.body.IDLKB);
            if (result.changedRows == 1)
                res.json({ success: "Thành công" });
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
        var dsDT= await BacSiModel.getDSDT(req.session.User.id);

        dsDT.forEach(element => {
            element.NgaySinh= dateFormat(new Date(element.NgaySinh), "dd/mm/yyyy");
        });

        res.render("main", {
            data: {
                page: 'dsdieutri',
                title: "Danh sách bệnh nhân điều trị",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                DSDT: dsDT
            }
        });
    }]);

router.route("/benh-nhan/:id/them-benh-dieu-tri")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var BN = await TaiKhoanModel.getChiTietTaiKhoan(req.params.id);

        res.render("main", {
            data: {
                page: 'addbenhdieutri',
                title: "Thêm bệnh điều trị",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                BN: {
                    ...BN[0],
                    ID: req.params.id
                }
            }
        });
    }])
    .post(async function (req, res) {
        if(req.body.ThemBenh=='on'){
            var benh = {
                HinhAnh: 'https://demofree.sirv.com/nope-not-here.jpg',
                TenBenh: req.body.TenBenh
            };
            delete req.body.ThemBenh
            delete req.body.TenBenh
            
            var newBenh=await LichKhamBenhModel.themBenh(benh);

            req.body.IDBenh = newBenh.insertId;
        }

        req.body.NhapVien= (req.body.NhapVien=='on')?1:0;
        req.body.ThoiGian= req.body.datepicker1 + ' - ' + req.body.datepicker2;
        req.body.TrangThai= 0;

        delete req.body.datepicker1
        delete req.body.datepicker2

        var themKHDT=await LichKhamBenhModel.themKHDT(req.body);

        if(themKHDT.affectedRows)
            res.redirect('/thong-tin/'+req.params.id);
        else
            res.json("Lỗi");
    });

router.route("/benh-nhan/:idbn/them-ke-hoach/:idbenh")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var BN = await TaiKhoanModel.getChiTietTaiKhoan(req.params.idbn);
        var Benh = await LichKhamBenhModel.getBenh(req.params.idbenh);

        res.render("main", {
            data: {
                page: 'themkehoach',
                title: "Thêm kế hoạch điều trị",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                BN: {
                    ...BN[0],
                    ID: req.params.idbn
                },
                Benh: Benh[0]
            }
        });
    }])
    .post(async function (req, res) {
        req.body.NhapVien= (req.body.NhapVien=='on')?1:0;
        req.body.ThoiGian= req.body.datepicker1 + ' - ' + req.body.datepicker2;
        req.body.TrangThai= 0;

        delete req.body.datepicker1
        delete req.body.datepicker2

        var themKHDT=await LichKhamBenhModel.themKHDT(req.body);

        if(themKHDT.affectedRows)
            res.redirect('/thong-tin/'+req.params.idbn);
        else
            res.json("Lỗi");
    });

router.route("/benh-nhan/:idbn/chi-tiet-ke-hoach/:idkh")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var BN = await TaiKhoanModel.getChiTietTaiKhoan(req.params.idbn);
        var KH = await BenhNhanModel.getCTKH(req.params.idkh);
        var Benh = await LichKhamBenhModel.getBenh(KH[0].IDBenh);
        var Lich = await LichKhamBenhModel.getLichHenDT(req.params.idkh);

        Lich.forEach(element => {
            element.ThoiGianKhamBenh=dateFormat(new Date(element.ThoiGianKhamBenh), "dd/mm/yyyy");
            element.TrangThai=(element.ThoiGianPheDuyet)?'Đã phê duyệt'
                                                        :((element.ThoiGianHuyLich)?'Đã hủy'
                                                                                   :((element.ThoiGianHoanThanh)?'Đã hoàn thành':'Chưa phê duyệt'));
        });

        res.render("main", {
            data: {
                page: 'ctkehoach',

                title: "Chi tiết kế hoạch điều trị",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                BN: {
                    ...BN[0],
                    ID: req.params.idbn
                },
                Benh: Benh[0],
                KH: KH[0],
                Lich: Lich
            }
        });
    }])
    .post(async function (req, res) {
        if(req.body.btnCapNhapKH){
            req.body.NhapVien= (req.body.NhapVien=='on')?1:0;
            req.body.TrangThai= (req.body.TrangThai=='on')?1:0;
            req.body.ThoiGian= req.body.datepicker1 + ' - ' + req.body.datepicker2;

            delete req.body.datepicker1
            delete req.body.datepicker2
            delete req.body.btnCapNhapKH

            var updateKH=await LichKhamBenhModel.updateKH(req.body,req.params.idkh);

            if(updateKH.changedRows)
                res.redirect('back');
            else
                res.json("Lỗi");
        }
        if(req.body.btnCapNhapKH){
            console.log(req.body)
        }
    });

router.route("/messenger")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        res.render("main", {
            data: {
                page: 'messenger',
                title: "Tin nhắn",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
            }
        });
    }]);

router.route("/messenger/chat/:id")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'chat',
                title: "Nhắn tin với anh A",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
            }
        });
    }]);


router.route("/phong-kham")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res, next) {
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
                
                var khunggio = await LichKhamBenhModel.getKhungGioConCho(req.body.ThoiGianKhamBenh, req.body.HinhThuc,req.body.IDBacSi);
                res.json(khunggio);
            }
            else
                res.redirect('back');
        }
    }, async function (req, res) {
        delete req.body.HinhThuc;
        
        req.body.IDBenhNhan =(req.body.IDBenhNhan)?req.body.IDBenhNhan:req.session.User.id;
        req.body.IDBacSi = (req.body.IDBacSi)?req.body.IDBacSi:req.query.bacsi;
        req.body.ThoiGianKhamBenh = dateFormat(new Date(req.body.ThoiGianKhamBenh), "yyyy-dd-mm");

        var result = await LichKhamBenhModel.checkKhungGio(req.body.ThoiGianKhamBenh, req.body.IDKhungGio);

        if (result[0]) {
            if(req.body.btnDatHen){
                var IDKH=req.body.IDKH;
                delete req.body.btnDatHen;
                delete req.body.IDKH;

                var datLich = await LichKhamBenhModel.addLich(req.body);

                var data={
                    IDLKB: datLich.insertId
                }
                var updateKH=await LichKhamBenhModel.updateKH(data,IDKH);
                res.redirect('back');
            }
            else{
                var datLich = await LichKhamBenhModel.addLich(req.body);
                res.redirect('/lich-kham');
            }
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
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
            }
        });
    }]);

router.route("/thanh-vien")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        var tvSSK = await TaiKhoanModel.getSSK(dataUser[0].Username);

        res.render("main", {
            data: {
                page: 'thanhviengd',
                title: "Thành viên gia đình",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
                TV: tvSSK
            }
        });
    }]);

router.route("/so-suc-khoe/:id/them-thanh-vien")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);

        res.render("main", {
            data: {
                page: 'themthanhvien',
                title: "Thêm thành viên gia đình",
                User: {
                    ...dataUser[0],
                    ID: req.session.User.id
                },
            }
        });
    }])
    .post(helper.uploadFile().fields([{ name: 'AnhDaiDien', maxCount: 1 }]), async function (req, res) {
        try {
            let file = req.files;
            let user = {
                HoTen: req.body.HoTen,
                GioiTinh: req.body.GioiTinh,
                NgaySinh: req.body.NgaySinh,
                AnhDaiDien: '/static/files/' + file.AnhDaiDien[0].filename,
                SoDT: req.body.SoDT,
                CMND: req.body.CMND,
                DiaChi: req.body.DiaChi,
                Email: req.body.Email,
                LoaiTK: 3
            };

            var addTK = await TaiKhoanModel.addUser(user);
            if (addTK.affectedRows) {
                delete req.body.HoTen;
                delete req.body.GioiTinh;
                delete req.body.NgaySinh;
                delete req.body.SoDT;
                delete req.body.CMND;
                delete req.body.DiaChi;
                delete req.body.Email;

                var data = {
                    ...req.body,
                    IDTK: addTK.insertId
                }

                var addBN = await TaiKhoanModel.addBenhNhan(data);
                if (addBN.affectedRows) {
                    var lkSSK = await TaiKhoanModel.lkTaiKhoan(req.params.id, addTK.insertId);
                    res.redirect('/thanh-vien');
                }
                else
                    res.json({ error: "Thất bại" });
            }
        }
        catch (e) {
            res.json({ error: e });
        }
    });

router.route("/ke-hoach-dieu-tri")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (req.query.user) {
            if (req.query.benh) {
                var KH=await BenhNhanModel.getKHBenh(req.query.user,req.query.benh);

                res.render("main", {
                    data: {
                        page: 'lichtrinhdt',
                        title: "Bệnh đang điều trị",
                        User: {
                            ...dataUser[0],
                            ID: req.session.User.id
                        },
                        KH: KH,
                        IDBN: req.query.user,
                    }
                });
            }
            else {
                var Benh = await BenhNhanModel.getBenhDT(req.query.user);
                res.render("main", {
                    data: {
                        page: 'benhdieutri',
                        title: "Bệnh đang điều trị",
                        User: dataUser[0],
                        ID: req.query.user,
                        Benh: Benh
                    }
                });
            }
        }
        else {
            var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
            var tvSSK = await TaiKhoanModel.getSSK(dataUser[0].Username);
            res.render("main", {
                data: {
                    page: 'chontv',
                    title: "Kế hoạch điều trị",
                    path: 'ke-hoach-dieu-tri',
                    User: {
                        ...dataUser[0],
                        ID: req.session.User.id
                    },
                    TV: tvSSK
                }
            });
        }
    }]);

router.route("/ho-so-suc-khoe")
    .get([mw.kiemTraDangNhap, mw.rolePemission, async function (req, res) {
        var IDTK = (req.query.user) ? req.query.user : req.session.User.id;

        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(IDTK);
        dataUser[0].NgaySinh = dateFormat(new Date(dataUser[0].NgaySinh), "yyyy-mm-dd");

        var getBN = await TaiKhoanModel.getChiTietBN(IDTK);

        res.render("main", {
            data: {
                page: 'hssk',
                title: "Hồ sơ sức khỏe",
                User: {
                    ...dataUser[0],
                    ID: IDTK
                },
                BN: getBN[0]
            }
        });
    }])
    .post(helper.uploadFile().fields([{ name: 'AnhDaiDien', maxCount: 1 }]), async function (req, res) {
        try {
            var IDTK = (req.query.user) ? req.query.user : req.session.User.id;
            let file = req.files;
            
            let user = {
                HoTen: req.body.HoTen,
                GioiTinh: req.body.GioiTinh,
                NgaySinh: req.body.NgaySinh,
                SoDT: req.body.SoDT,
                CMND: req.body.CMND,
                DiaChi: req.body.DiaChi,
                Email: req.body.Email,
            };

            var updateTK = await TaiKhoanModel.updateTK(user, IDTK);

            delete req.body.HoTen;
            delete req.body.GioiTinh;
            delete req.body.NgaySinh;
            delete req.body.SoDT;
            delete req.body.CMND;
            delete req.body.DiaChi;
            delete req.body.Email;

            var updateBN = await TaiKhoanModel.updateBN(req.body, IDTK);
            
            if (req.files!=null) {
                var updateAnh = await TaiKhoanModel.updateTK({
                    AnhDaiDien: '/static/files/' + file.AnhDaiDien[0].filename
                }, IDTK);
            }

            res.redirect('/thanh-vien');
        }
        catch (e) {
            res.redirect('/thanh-vien');
        }
    });
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