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
/*
function uploadAvatar(id, path) {
    if (id && path) {
        var defer = q.defer();
        conn.query("UPDATE taikhoan SET HinhDaiDien=? WHERE ID_TaiKhoan=?", [path, id], function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}
function updateUser(id, user) {
    if (id && user) {
        var defer = q.defer();
        conn.query("UPDATE taikhoan SET ? WHERE ID_TaiKhoan=?", [user, id], function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}
function changePassword(id, password) {
    if (id && password) {
        var defer = q.defer();
        conn.query("UPDATE taikhoan SET MatKhau=? WHERE ID_TaiKhoan=?", [password, id], function (error, results) {
            if (error)
                defer.reject(error);
            else
                defer.resolve(results);
        });

        return defer.promise;
    }

    return false;
}

function getDSTaiKhoan(start, limit) {
    var defer = q.defer();
    conn.query('SELECT * FROM taikhoan where LoaiTK NOT IN (-1) order by ID_TaiKhoan DESC limit ?,?', [start, limit], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function getSlTaiKhoan() {
    var defer = q.defer();
    conn.query('SELECT COUNT(ID_TaiKhoan) as sl FROM taikhoan where LoaiTK NOT IN (-1)', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });
    return defer.promise;
}
function timKiemTaiKhoan(tukhoa) {
    var defer = q.defer();
    conn.query('SELECT * FROM taikhoan WHERE LoaiTK NOT IN (-1) and TenDangNhap like "%' + tukhoa + '%" or HoVaTen like "%' + tukhoa + '%" or SoDienThoai like "%' + tukhoa + '%" or Email like "%' + tukhoa + '%" order by ID_TaiKhoan DESC', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function voHieuHoaTaiKhoan(ID_TaiKhoan, doitac) {
    var defer = q.defer();
    var cmd = (doitac) ? 'UPDATE taikhoan SET LoaiTK=1 WHERE ID_TaiKhoan=?' : 'UPDATE taikhoan SET LoaiTK=-1 WHERE ID_TaiKhoan=?';
    conn.query(cmd, [ID_TaiKhoan], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}*/
module.exports = {
    addUser: addUser,
    xuLiLogin: xuLiLogin,
    getChiTietTaiKhoan: getChiTietTaiKhoan,
    addBenhNhan: addBenhNhan,
    addSSK: addSSK,
    lkTaiKhoan: lkTaiKhoan
}