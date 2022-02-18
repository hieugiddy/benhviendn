var q = require("q");
var db = require("../common/DB");
var conn = db.getConnection();

function getLichKhamBenh(ID) {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong WHERE lichkhambenh.IDBenhNhan=? ORDER BY ThoiGianDatLich DESC', [ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}
function filterLichKhamBenh(ID, start,end) {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong WHERE lichkhambenh.IDBenhNhan=? AND ThoiGianKhamBenh BETWEEN ? AND ? ORDER BY ThoiGianDatLich DESC', [ID, start,end], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function chiTietLKB(IDBN,IDLKB) {
    var defer = q.defer();
    conn.query('SELECT lichkhambenh.ID, BenhCanKham,TenPhongKham,TrieuChung,GhiChu,GioBatDau,GioKetThuc,HinhThuc,ThoiGianDatLich,ThoiGianPheDuyet,ThoiGianHuyLich,ThoiGianKhamBenh,ThoiGianDenKhamTT,ThoiGianHoanThanh,SanSangKB,ChiPhi, BN.ID AS "IDBN",BN.HoTen AS "HoTenBN",BS.ID AS "IDBS",BS.HoTen AS "HoTenBS" FROM lichkhambenh INNER JOIN khunggio ON lichkhambenh.IDKhungGio=khunggio.ID INNER JOIN phongkham ON khunggio.IDPhongKham=phongkham.IDPhong INNER JOIN taikhoan AS BN ON lichkhambenh.IDBenhNhan=BN.ID INNER JOIN taikhoan AS BS ON lichkhambenh.IDBacSi=BS.ID WHERE lichkhambenh.IDBenhNhan=? AND lichkhambenh.ID=?', [IDBN,IDLKB], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getDSBenhNhan() {
    var defer = q.defer();
    conn.query('SELECT * FROM taikhoan INNER JOIN chitietsosuckhoe ON taikhoan.ID=chitietsosuckhoe.IDTK WHERE LoaiTK=3', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getDSBenh(IDBN) {
    var defer = q.defer();
    conn.query('SELECT DISTINCT benh.ID, TenBenh FROM benh INNER JOIN kehoachdieutri ON benh.ID=kehoachdieutri.IDBenh WHERE IDBenhNhan=?',[IDBN], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getKHBenh(IDBN,IDBenh) {
    var defer = q.defer();
    conn.query('SELECT * FROM kehoachdieutri WHERE IDBenhNhan=? AND IDBenh=?',[IDBN,IDBenh], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getCTKH(ID) {
    var defer = q.defer();
    conn.query('SELECT * FROM kehoachdieutri WHERE ID=?',[ID], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

function getBenhDT(IDBN) {
    var defer = q.defer();
    conn.query('SELECT * FROM benh WHERE ID IN (SELECT DISTINCT IDBenh FROM kehoachdieutri WHERE IDBenhNhan=?)',[IDBN], function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

module.exports = {
    getLichKhamBenh: getLichKhamBenh,
    filterLichKhamBenh:filterLichKhamBenh,
    chiTietLKB:chiTietLKB,
    getDSBenhNhan: getDSBenhNhan,
    getDSBenh: getDSBenh,
    getKHBenh: getKHBenh,
    getCTKH: getCTKH,
    getBenhDT: getBenhDT
}