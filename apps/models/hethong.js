var q = require("q");
var db = require("../common/DB");
var conn = db.getConnection();
/*
function getThongTinHeThong() {
    var defer = q.defer();
    conn.query('SELECT * FROM cauhinhhethong', function (error, results, fields) {
        if (error)
            defer.reject(error);
        else
            defer.resolve(results);
    });

    return defer.promise;
}

module.exports = {
    getThongTinHeThong: getThongTinHeThong,
}*/