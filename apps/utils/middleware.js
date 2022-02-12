var TaiKhoanModel = require("../models/taikhoan");
var BacSiModel = require("../models/bacsi");
var BenhNhanModel = require("../models/benhnhan");
var LichKhamBenhModel = require("../models/lichkhambenh");

function kiemTraDangNhap(req, res, next) {
    if (req.session.User) {
        return next();
    }
    return res.redirect('/account');
}

async function rolePemission(req, res, next) {
    var routeName = req.app.path() + (req.route.path || req.route.regexp && req.route.regexp.source);
    console.log(routeName);

    if (routeName.indexOf("lich-kham/chi-tiet-lich-kham") != -1) {
        var dataUser = await TaiKhoanModel.getChiTietTaiKhoan(req.session.User.id);
        if (dataUser[0].LoaiTK == 3) {
            var result = await BenhNhanModel.chiTietLKB(req.session.User.id, req.params.idlich);
        }
        else if (dataUser[0].LoaiTK == 2)
            var result = await BacSiModel.chiTietLKB(req.session.User.id, req.params.idlich);
        else
            var result = await LichKhamBenhModel.chiTietLKB(req.params.idlich);

        if (result) {
            req.body.LKB = result;
            return next();
        }
    }
    //return res.json({"Lỗi":"Bạn không có quyền truy cập đường link này"});
    return next();
}

module.exports = {
    kiemTraDangNhap: kiemTraDangNhap,
    rolePemission: rolePemission
}

