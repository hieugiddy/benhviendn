var express = require("express");
var DB = require("../common/DB");
var conn = DB.getConnection();
var router = express.Router();
var UserModel = require("../models/user");
var UserHelper = require("../helpers/default");
const multer = require('multer');
var config = require('config');
var dateFormat = require('dateformat');

const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, appRoot + '/public/img');
    },
    filename(req, file, callback) {
        callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    },
});
const upload = multer({ storage: Storage });


router.route("/dang-ky")
    .post(function (req, res) {
        var user = req.body;
        var ngSinh = '2000-01-01';
        var gTinh = 1;
        var qTich = 'VN';
        try {
            if (!UserHelper.usernameValidation(user.username))
                throw 'Tên đăng nhập không hợp lệ, vui lòng nhập lại';
            if (!UserHelper.passwordValidation(user.password))
                throw 'Mật khẩu phải có ít nhất 8 ký tự, bắt đầu bằng ký tự Hoa, có ít nhất 1 ký tự thường, ít nhất 1 ký tự số';
            if (!UserHelper.telephoneValidation(user.telephone))
                throw 'Số điện thoại phải có ít nhất 10 số hoặc 11 số, không được chứa ký tự chuỗi, ký tự đặc biệt';

            users = {
                TenDangNhap: user.username,
                MatKhau: user.password,
                HoVaTen: user.username,
                SoDienThoai: user.telephone,
                NgaySinh: ngSinh,
                GioiTinh: gTinh,
            }
            var result = UserModel.addUser(users);

            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json({ "Messenger": "Đăng ký thành công, xin mời đăng nhập để sử dụng dịch vụ" });
                }).catch(function (err) {
                    if (err.code == "ER_DUP_ENTRY")
                        res.json({ "Messenger": "Tên đăng nhập đã tồn tại" });
                    else
                        res.json({ "Messenger": "Thông tin nhập vào không chính xác" });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }

    });
router.route("/kiem-tra-dang-nhap")
    .post(function (req, res) {
        var user = req.body;

        try {
            if (!UserHelper.usernameValidation(user.username))
                throw 'Tên đăng nhập không hợp lệ';
            if (!UserHelper.passwordValidation(user.password))
                throw 'Mật khẩu không đúng';
            var result = UserModel.xuLiLogin(user.username, user.password);

            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json(data);
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }

    });
router.post('/upload-avatar', upload.array('photo', 3), (req, res) => {
    let file = req.files;
    let id = req.body.id;

    let avatar = config.get('server.link') + '/static/img/' + file[0].filename;
    let result = UserModel.uploadAvatar(id, avatar);

    result.then(function (data) {
        res.status(200).json({
            message: 'Thay đổi ảnh đại diện thành công',
        });
    }).catch(function (err) {
        res.json({ message: err });
    })

});
router.route("/cap-nhat-tai-khoan")
    .post(function (req, res) {
        var user = req.body.user;
        try {
            if (!UserHelper.telephoneValidation(user.SoDienThoai))
                throw 'Số điện thoại sai định dạng';
            var ngSinh = dateFormat(new Date(user.NgaySinh), "yyyy-mm-dd");
            user = {
                ...user,
                NgaySinh: ngSinh
            }

            var result = UserModel.updateUser(user.ID_TaiKhoan, user);

            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json({ "Messenger": "Thay đổi thông tin tài khoản thành công" });
                }).catch(function (err) {
                    res.json({ "Messenger": "Thông tin nhập vào không chính xác" });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });

router.route("/doi-mat-khau")
    .post(function (req, res) {
        var user = req.body.user;
        var NewPassword = req.body.NewPassword;
        var OldPassword = req.body.OldPassword;

        try {
            if (!UserHelper.passwordValidation(NewPassword))
                throw 'Mật khẩu sai định dạng';

            var isOldPassword = UserModel.xuLiLogin(user.TenDangNhap, OldPassword);

            if (!isOldPassword)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                isOldPassword.then(function (data) {
                    if (data[0]) {
                        var result = UserModel.changePassword(user.ID_TaiKhoan, NewPassword);
                        if (!result)
                            res.json({ "Messenger": "Đã có lỗi xảy ra" });
                        else
                            result.then(function (data) {
                                res.json({ "Messenger": "Thay đổi mật khẩu thành công" });
                            }).catch(function (err) {
                                res.json({ "Messenger": "Thông tin nhập vào không chính xác" });
                            })
                    }
                    else {
                        res.json({ "Messenger": "Mật khẩu cũ không chính xác" });
                    }
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
        var user = req.body;

        try {
            var dsYeuCau = await UserModel.dsYeuCauCuuHo(user.ID_TaiKhoan, user.TrangThai).then((data) => data);
            let dsHinhAnhVaYeuCau = await Promise.all(dsYeuCau.map(async (item) => {
                let dsHinhAnh = await UserModel.dsHinhAnhYeuCau(item.ID_YeuCau)

                return ({
                    ...item,
                    HinhAnh: dsHinhAnh,
                })
            })).then(data => data);

            res.json(dsHinhAnhVaYeuCau);
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.post("/them-yeu-cau", upload.array('photo', 20), async function (req, res) {
    var data = req.body;
    let file = req.files;

    try {
        var YeuCauData = {
            ID_TaiKhoan: data.ID_TaiKhoan,
            ID_ChiNhanh: data.ID_ChiNhanh,
            LiDoCuuHo: data.LiDoCuuHo,
            MoTaYeuCau: data.MoTaYeuCau,
            DiaDiemCuuHo: data.DiaDiemCuuHo,
            ViDo: data.ViDo,
            KinhDo: data.KinhDo
        }

        var result = await UserModel.themYeuCauCuuHo(YeuCauData);
        var ID_YeuCau = await UserModel.getIDYeuCau(data.ID_TaiKhoan, data.ID_ChiNhanh).then((data) => data);

        let chenAnh = await Promise.all(file.map(async (item) => {
            var HinhAnhData = {
                LinkAnh: config.get('server.link') + '/static/img/' + item.filename,
                ID_YeuCau: ID_YeuCau[0].ID_YeuCau
            }
            var themHinhAnh = await UserModel.themHinhAnhCuuHo(HinhAnhData);
        }));
        res.json(ID_YeuCau[0].ID_YeuCau);
    }
    catch (e) {
        res.json({ "KetQua": false });
    }
});
router.route("/chi-tiet-yeu-cau")
    .post(async function (req, res) {
        var ID_YeuCau = req.body.ID_YeuCau;

        try {
            var result = UserModel.getChiTietYeuCauCuuHo(ID_YeuCau);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json(data[0]);
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.route("/huy-yeu-cau")
    .post(async function (req, res) {
        var ID_YeuCau = req.body.ID_YeuCau;

        try {
            var result = UserModel.setTrangThaiYeuCau(ID_YeuCau, 3);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json({ "Messenger": true });
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.route("/tiep-nhan-yeu-cau")
    .post(async function (req, res) {
        var ID_YeuCau = req.body.ID_YeuCau;

        try {
            var result = UserModel.setTrangThaiYeuCau(ID_YeuCau, 1);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then(function (data) {
                    res.json({ "Messenger": true });
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }
    });
router.post("/hoan-thanh-yeu-cau", async function (req, res) {
    var { ID_YeuCau, MoTaChiPhi, TongChiPhi } = req.body;

    try {
        let setTrangThai = await UserModel.setTrangThaiYeuCau(ID_YeuCau, 2);
        let chiPhi = await UserModel.chiPhiYeuCauCuuHo(ID_YeuCau, MoTaChiPhi, TongChiPhi);
        res.json(true);
    }
    catch (e) {
        res.json(false);
    }
});
router.post("/hinh-anh-yeu-cau", async function (req, res) {
    var { ID_YeuCau } = req.body;

    try {
        let result = await UserModel.dsHinhAnhYeuCau(ID_YeuCau);
        res.json(result);
    }
    catch (e) {
        res.json(false);
    }
});
router.post("/danh-gia", function (req, res) {
    var data = {
        NoiDung: req.body.NoiDung,
        Diem: req.body.Diem,
        ID_TaiKhoan: req.body.ID_TaiKhoan,
        ID_ChiNhanh: req.body.ID_ChiNhanh
    };

    try {
        let result = UserModel.addDanhGia(data);
        result.then(() => {
            res.json(true)
        }).catch((e) => {
            res.json(e)
        })
    }
    catch (e) {
        res.json(false);
    }
});
router.route("/chi-tiet-danh-gia")
    .post(function (req, res) {
        try {
            var result = UserModel.getChiTietDanhGia(req.body.ID_TaiKhoan, req.body.ID_ChiNhanh);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then((data) => {
                    res.json(data);
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }

    });
router.route("/chinh-sua-danh-gia")
    .post(function (req, res) {
        var {Diem,NoiDung,ID_DanhGia} = req.body;
        try {
            var result = UserModel.chinhSuaDanhGia(Diem,NoiDung,ID_DanhGia);
            if (!result)
                res.json({ "Messenger": "Đã có lỗi xảy ra" });
            else
                result.then((data) => {
                    res.json(true);
                }).catch(function (err) {
                    res.json({ "Messenger": err });
                })
        }
        catch (e) {
            res.json({ "Messenger": e });
        }

    });
module.exports = router;