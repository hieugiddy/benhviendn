var q = require("q");
var db = require("../common/DB");
var conn = db.getConnection();

function getKhungGioConCho(ThoiGian, HinhThuc) {
    var defer = q.defer();
    conn.query('SELECT khunggio.ID, GioBatDau, GioKetThuc, count(lichkhambenh.ID) as sl, khunggio.SoLuong as MaxSL FROM lichkhambenh INNER JOIN khunggio on lichkhambenh.IDKhungGio=khunggio.ID WHERE date(ThoiGianDatLich)=? and ThoiGianHuyLich is null AND HinhThuc=? GROUP BY IDKhungGio HAVING sl < khunggio.SoLuong', [ThoiGian, HinhThuc], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function addLich(data) {
    var defer = q.defer();
    conn.query('INSERT INTO lichkhambenh SET ?', data, function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getLichKhamBenh() {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong ORDER BY ThoiGianDatLich DESC', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function filterLichKhamBenh(start, end) {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong WHERE ThoiGianKhamBenh BETWEEN ? AND ? ORDER BY ThoiGianDatLich DESC', [start, end], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function checkKhungGio(ThoiGianKhamBenh, IDKhungGio) {
    var defer = q.defer();
    conn.query('SELECT count(lichkhambenh.ID) as sl, khunggio.SoLuong as MaxSL FROM lichkhambenh INNER JOIN khunggio on lichkhambenh.IDKhungGio=khunggio.ID WHERE date(ThoiGianKhamBenh)=? and ThoiGianHuyLich is null and IDKhungGio=?', [ThoiGianKhamBenh, IDKhungGio], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function chiTietLKB(IDLKB) {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,TrieuChung,GhiChu,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB,ChiPhi,BN.HoTen AS "HoTenBN",BS.HoTen AS "HoTenBS" FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong INNER JOIN taikhoan AS BN ON lichkhambenh.IDBenhNhan=BN.ID INNER JOIN taikhoan AS BS ON lichkhambenh.IDBacSi=BS.ID WHERE lichkhambenh.ID=?', [IDLKB], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function pheDuyet(ThoiGianPheDuyet, ID) {
    var defer = q.defer();
    conn.query('UPDATE lichkhambenh SET ThoiGianPheDuyet=? WHERE ID=?', [ThoiGianPheDuyet, ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function huyLich(ThoiGianHuyLich, LiDo, ID) {
    var defer = q.defer();
    conn.query('UPDATE lichkhambenh SET ThoiGianHuyLich=?, GhiChu=? WHERE ID=?', [ThoiGianHuyLich, LiDo, ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getKQKhamBenh(ID) {
    var defer = q.defer();
    conn.query('SELECT * FROM `chitietketquakb` INNER JOIN ketquakhambenh ON chitietketquakb.IDKetQuaKB=ketquakhambenh.ID WHERE chitietketquakb.IDLKB=?', [ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getThuocDT(ID) {
    var defer = q.defer();
    conn.query('SELECT * FROM thuocdieutri INNER JOIN thuoc ON thuocdieutri.IDThuoc=thuoc.ID WHERE thuocdieutri.IDLKB=?', [ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getThuoc(TenThuoc) {
    var defer = q.defer();
    conn.query('SELECT * FROM thuoc WHERE TenThuoc LIKE "%?%"', [TenThuoc], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function checkQRCode(IDLKB, IDBN) {
    var defer = q.defer();
    conn.query('SELECT ID FROM lichkhambenh WHERE ID=? AND IDBenhNhan=?', [IDLKB, IDBN], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function xacNhanDenKham(IDLKB) {
    var defer = q.defer();
    conn.query('UPDATE lichkhambenh SET ThoiGianDenKhamTT=CURRENT_TIMESTAMP() WHERE ID=?', [IDLKB], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function sanSangKhamBenh(IDLKB, IDBN) {
    var defer = q.defer();
    conn.query('UPDATE lichkhambenh SET SanSangKB=SanSangKB+1 WHERE ID=? AND IDBenhNhan=?', [IDLKB, IDBN], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getStatusLKB(IDLKB) {
    var defer = q.defer();
    conn.query('SELECT SanSangKB FROM lichkhambenh WHERE ID=?', [IDLKB], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

module.exports = {
    getKhungGioConCho: getKhungGioConCho,
    addLich: addLich,
    getLichKhamBenh: getLichKhamBenh,
    checkKhungGio: checkKhungGio,
    filterLichKhamBenh: filterLichKhamBenh,
    chiTietLKB: chiTietLKB,
    pheDuyet: pheDuyet,
    huyLich: huyLich,
    getKQKhamBenh: getKQKhamBenh,
    getThuocDT: getThuocDT,
    getThuoc: getThuoc,
    checkQRCode: checkQRCode,
    xacNhanDenKham: xacNhanDenKham,
    sanSangKhamBenh: sanSangKhamBenh,
    getStatusLKB: getStatusLKB
}