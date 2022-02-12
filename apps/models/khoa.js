var q = require("q");
var db = require("../common/DB");
var conn = db.getConnection();

function getKhoa() {
    var defer = q.defer();
    conn.query('SELECT * FROM khoa', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

module.exports = {
    getKhoa: getKhoa
}