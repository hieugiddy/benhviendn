var q = require("q");
var db = require("../common/DB");
var conn = db.getConnection();

function addUser(user) {
    if (user) {
        var defer = q.defer();
        conn.query('INSERT INTO taikhoan SET ?', user, function (error, results, fields) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}
function addBenhNhan(data) {
    if (data) {
        var defer = q.defer();
        conn.query('INSERT INTO benhnhan SET ?', data, function (error, results, fields) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}
function addSSK(Username) {
    var defer = q.defer();
    conn.query('INSERT INTO sosuckhoe(Username) VALUES(?)', Username, function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function getSSK(Username) {
    var defer = q.defer();
    conn.query('SELECT IDSSK, IDTK, HoTen, AnhDaiDien FROM chitietsosuckhoe INNER JOIN sosuckhoe ON chitietsosuckhoe.IDSSK=sosuckhoe.ID INNER JOIN taikhoan ON chitietsosuckhoe.IDTK=taikhoan.ID WHERE sosuckhoe.Username=?', Username, function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function lkTaiKhoan(IDSSK, IDTK) {
    var defer = q.defer();
    conn.query('INSERT INTO chitietsosuckhoe VALUES(?,?)', [IDSSK, IDTK], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function xuLiLogin(username, password) {
    if (username && password) {
        var defer = q.defer();
        conn.query("SELECT ID FROM taikhoan WHERE Username=? and Password=?", [username, password], function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}
function getChiTietTaiKhoan(id) {
    var defer = q.defer();
    conn.query("SELECT Username,HoTen,GioiTinh,NgaySinh,AnhDaiDien,SoDT,CMND,DiaChi,Email,LoaiTK FROM taikhoan WHERE ID=?", [id],
        function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

    return defer.promise;
}

function getChiTietBN(id) {
    var defer = q.defer();
    conn.query("SELECT * FROM benhnhan WHERE IDTK=?", [id],
        function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

    return defer.promise;
}

function updateTK(data, id) {
    var defer = q.defer();
    conn.query("UPDATE taikhoan SET ? WHERE ID=?", [data, id],
        function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

    return defer.promise;
}

function updateBN(data, id) {
    var defer = q.defer();
    conn.query("UPDATE benhnhan SET ? WHERE IDTK=?", [data, id],
        function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

    return defer.promise;
}

module.exports = {
    addUser: addUser,
    xuLiLogin: xuLiLogin,
    getChiTietTaiKhoan: getChiTietTaiKhoan,
    addBenhNhan: addBenhNhan,
    addSSK: addSSK,
    lkTaiKhoan: lkTaiKhoan,
    getSSK: getSSK,
    getChiTietBN: getChiTietBN,
    updateBN: updateBN,
    updateTK: updateTK
}