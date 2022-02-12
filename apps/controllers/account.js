var express = require("express");
var router = express.Router();
var helper = require("../helpers/default");
var TaiKhoanModel = require("../models/taikhoan");

router.route("/")
   .get(function (req, res) {
      res.render("login", {
         data: {
            title: "Đăng nhập tài khoản",
            TenWeb: "Bệnh viện Đà Nẵng Ecosystem"
         }
      });
   })
   .post(async function (req, res) {
      var user = req.body;

      try {
         if (!helper.usernameValidation(user.username))
            throw 'Tên đăng nhập không được để trống';
         if (!helper.passwordValidation(user.password))
            throw 'Mật khẩu không được để trống';
         var result = TaiKhoanModel.xuLiLogin(user.username, user.password);

         if (!result)
            throw 'Đã có lỗi xảy ra';
         else
            result.then(function (data) {
               if (data.length == 0)
                  throw 'Tên đăng nhập hoặc mật khẩu không tồn tại';

               helper.setSessionDangNhap(req, data[0].ID);
               res.json({
                  Status: 1
               });
            }).catch(function (e) {
               res.json({
                  Status: 0,
                  Messenger: e
               });
            });
      }
      catch (e) {
         res.json({
            Status: 0,
            Messenger: e
         });
      }
   });
router.route("/signup")
   .get(function (req, res) {
      res.render("signup", {
         data: {
            title: "Đăng ký tài khoản",
            TenWeb: ""
         }
      });
   })
   .post(async function (req, res) {
      delete req.body.confirmPassword;
      delete req.body.acceptTerms;

      var SoTheBHYT = req.body.SoTheBHYT;
      delete req.body.SoTheBHYT;
      req.body.LoaiTK = 3;

      var user = req.body;
 
      try {
         if (!helper.usernameValidation(user.UserName))
            throw 'Tên đăng nhập không hợp lệ, vui lòng nhập lại';
         if (!helper.passwordValidation(user.Password))
            throw 'Mật khẩu phải có ít nhất 8 ký tự, bắt đầu bằng ký tự Hoa, có ít nhất 1 ký tự thường, ít nhất 1 ký tự số';
         if (!helper.telephoneValidation(user.SoDT))
            throw 'Số điện thoại phải có ít nhất 10 số hoặc 11 số, không được chứa ký tự chuỗi, ký tự đặc biệt';


         var result = TaiKhoanModel.addUser(user);
         
         if (!result)
            throw 'Đã có lỗi xảy ra';
         else
            result.then(async function (data) {
               var bn={
                  IDTK: data.insertId,
                  SoTheBHYT: SoTheBHYT
               }
               var addBN= await TaiKhoanModel.addBenhNhan(bn);
               var createSSK= await TaiKhoanModel.addSSK(user.UserName);
               var lkSSK= await TaiKhoanModel.lkTaiKhoan(createSSK.insertId,data.insertId)

               req.session.messenger = "Đăng ký thành công, xin mời đăng nhập để sử dụng dịch vụ";
               res.redirect('/account');
            }).catch(function (err) {
               var msg;
               if (err.code == "ER_DUP_ENTRY")
                  msg = "Tên đăng nhập đã tồn tại, hoặc số thẻ BHYT đã tồn tại bởi người dùng khác";
               else
                  msg = "Thông tin nhập vào không chính xác";
                  
               req.session.messenger = msg;
               res.send('<script>history.back()</script>');
            })
      }
      catch (e) {
         req.session.messenger = e;
         res.send('<script>history.back()</script>');
      }
   });
router.route("/dang-xuat")
   .get(function (req, res) {
      helper.dangXuat(req, res)
   });
module.exports = router;