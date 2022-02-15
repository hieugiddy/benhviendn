var config = require("config");
const multer = require('multer');
var TaiKhoanModel = require("../models/taikhoan");

const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, appRoot + '/public/files');
    },
    filename(req, file, callback) {
        callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    },
});

function uploadFile() {
    return multer({ storage: Storage });
}



function setSessionDangNhap(req, id) {
    req.session.User = {
        id: id,
    }
}

function dangXuat(req, res) {
    req.session.destroy(function (err) {
        res.redirect("/");
    })
}
function passwordValidation(password) {
    var passwordValidator = require('password-validator');

    // Create a schema
    var schema = new passwordValidator();

    // Add properties to it
    schema
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        .has().digits(1)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

    return schema.validate(password);
}
function telephoneValidation(telephone) {
    var passwordValidator = require('password-validator');
    var schema = new passwordValidator();
    schema
        .is().min(10)                                    // Minimum length 10
        .is().max(11)                                  // Maximum length 11
        .has().digits(10)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
    return schema.validate(telephone);
}
function usernameValidation(username) {
    var passwordValidator = require('password-validator');
    var schema = new passwordValidator();
    schema
        .is().min(1)
        .is().max(20)
        .has().not().spaces()
    return schema.validate(username);
}
module.exports = {
    setSessionDangNhap: setSessionDangNhap,
    dangXuat: dangXuat,
    uploadFile: uploadFile,
    passwordValidation: passwordValidation,
    usernameValidation: usernameValidation,
    telephoneValidation: telephoneValidation,
}