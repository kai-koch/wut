var format = require('util').format;
var isArray = require('util').isArray;
var unshorten = require('unshorten');

function UnshortenWrapper(dbh) {
    var that = this;
    this.dbh = dbh;
    this.primaries = {};
    this.incoming = [];
    this.results = [];
    this.updateQue = [];
    this.insertQue = [];
    this.insRowStats = 0;
    this.updRowStats = 0;
    this.madeRequests = 0;
    this.urlPerSec = 30;
    this.regexRecords = /Records: \d/;
    this.sqlTplSelect = 'SELECT `tweet_id`, `index_of`, `resolve_index_of`,' +
        ' `expanded_url` FROM `wut_urls_resolved`' +
        ' WHERE `resolved` = "false"' +
        ' ORDER BY `tweet_id`, `index_of`, `resolve_index_of`' +
        ' LIMIT 0 , ' + this.urlPerSec;
    this.sqlTplInsert = "INSERT IGNORE INTO wut_urls_resolved (`tweet_id`, `index_of`," +
        " `resolve_index_of`, `expanded_url`, `resolved`, `statuscode`," +
        " `httpVersion`, `contentType`, `date`) VALUES %s";
    this.sqlTplInsertValues = '(%s,%d,%d,%s,%s,%s,%s,%s,%s)';
    this.sqlTplUpdate = "UPDATE wut_urls_resolved SET" +
        " `resolved` = %s, `statuscode` = %s, `httpVersion` = %s," +
        " `contentType` = %s, `date` = %s" +
        " WHERE `tweet_id` = %s AND `index_of` = %d" +
        " AND `resolve_index_of` = %d;";
    this.askDbIntervalId = setInterval(function () {
        that.checkQues();
    }, 2000);
    this.printStats();
    this.printStatsIntervalId = setInterval(function () {
        that.printStats();
    }, 30000);
}

UnshortenWrapper.prototype.printStats = function () {
    var now = new Date();
    console.log(format('[%s] %d Requests. UPD %d / INS %d Urls.\n%s',
        now.toISOString(),
        this.madeRequests,
        this.updRowStats,
        this.insRowStats,
        JSON.stringify(this.primaries)));
};

UnshortenWrapper.prototype.askDBforUrls = function () {
    var that = this;
    this.dbh.query(this.sqlTplSelect, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            that.incoming = that.incoming.concat(response);
            that.requestUrls();
        }
    });
};

UnshortenWrapper.prototype.checkQues = function () {
    var sql, rows = [], that = this;
    if (this.updateQue.length) {
        rows = rows.concat(this.updateQue);
        this.updateQue = [];
    }
    if (this.insertQue.length) {
        rows.push(format(this.sqlTplInsert, this.insertQue.join(',') + ";"));
        this.insertQue = [];
    }
    if (rows.length) {
        sql = "START TRANSACTION;\n" + rows.join("\n") + "\nCOMMIT;\n";
        this.dbh.query(sql, function (err, response) {
            that.cbDbhStatistic(err, response, that);
        });
    } else {
        this.askDBforUrls();
    }
};

UnshortenWrapper.prototype.cbDbhStatistic = function (err, result, that) {
    var i, len;
    if (err) {
        console.log(err);
    }
    if (isArray(result)) {
        len = result.length;
        for (i = 0; i < len; i += 1) {
            if (result[i].message) {
                if (1 === result[i].message.search(that.regexRecords)) {
                    that.insRowStats += result[i].affectedRows;
                } else {
                    that.updRowStats += 1;
                }
            }
        }
    } else {
        console.log("Result not an Array in UnshortenWrapper.cbDbhStatistic");
    }
};

UnshortenWrapper.prototype.makeQueResponse = function (incom, that) {
    return function queResponseForSqlSingleQuery(err, resp) {
        var sqlValues = {
            tweet_id: incom.tweet_id,
            index_of: incom.index_of,
            resolve_index_of: incom.resolve_index_of,
            expanded_url: incom.expanded_url
        };
        var property = format("%s-%d-%d",
            incom.tweet_id,
            incom.index_of,
            incom.resolve_index_of
            );
        delete that.primaries[property];
        if (err) {
            // err, update to final
            sqlValues.resolved = 'true';
            sqlValues.statusCode = null;
            sqlValues.httpVersion = null;
            sqlValues.contentType = err.name + ": " + err.message;
            sqlValues.date = that.dbh.escape(
                new Date(resp.headers.date)
            );
            that.updateQue.push(that.getUpdateSql(sqlValues));
        } else {
            if (resp.statusCode === 301 ||
                    resp.statusCode === 302) {
                if (resp.headers.date) {
                    resp.headers.date =
                        that.dbh.escape(new Date(resp.headers.date));
                } else {
                    resp.headers.date = 'NULL';
                }
                // Update OLD
                that.updateQue.push(
                    that.getUpdateSql(
                        {
                            tweet_id: incom.tweet_id,
                            index_of: incom.index_of,
                            resolve_index_of: incom.resolve_index_of,
                            expanded_url: incom.expanded_url,
                            resolved: 'true',
                            statusCode: resp.statusCode,
                            httpVersion: resp.httpVersion,
                            contentType: resp.headers['content-type'],
                            date: resp.headers.date
                        }
                    )
                );
                // ADD new url
                sqlValues.expanded_url = resp.headers.location;
                sqlValues.resolve_index_of += 1;
                if (sqlValues.resolve_index_of < 10) {
                    // new URL
                    sqlValues.resolved = 'false';
                    sqlValues.statusCode = null;
                    sqlValues.httpVersion = null;
                    sqlValues.contentType = null;
                    sqlValues.date = 'NULL';
                } else {
                    // final URL, we do not resolve more than 10
                    // redirects
                    sqlValues.resolved = 'true';
                    sqlValues.statusCode = null;
                    sqlValues.httpVersion = null;
                    sqlValues.contentType =
                        'Reached maximum number resolves';
                    sqlValues.date =
                        that.dbh.escape(new Date(resp.headers.date));
                }
                that.insertQue.push(that.getInsertValuesSql(sqlValues));
            } else {
                // no new url, update to final
                sqlValues.resolved = 'true';
                sqlValues.statusCode = resp.statusCode;
                sqlValues.httpVersion = resp.httpVersion;
                sqlValues.contentType = resp.headers['content-type'];
                sqlValues.date =
                    that.dbh.escape(new Date(resp.headers.date));
                that.updateQue.push(that.getUpdateSql(sqlValues));
            }
        }
    };
};

UnshortenWrapper.prototype.makeProcResponse = function (incom, that) {
    var property = format("%s-%d-%d",
        incom.tweet_id,
        incom.index_of,
        incom.resolve_index_of
        );
    if (!that.primaries.hasOwnProperty(property)) {
        that.primaries[property] = true;
        return function procResponse() {
            that.madeRequests += 1;
            unshorten(incom.expanded_url, (that.makeQueResponse(incom, that)));
        };
    }
    return function () {};
};

UnshortenWrapper.prototype.requestUrls = function () {
    var that = this;
    while (this.incoming.length) {
        (this.makeProcResponse(this.incoming.pop(), that))();
    }
};

UnshortenWrapper.prototype.getUpdateSql = function (valObj) {
    return format(this.sqlTplUpdate,
        "'" + valObj.resolved + "'",
        this.dbh.escape(valObj.statusCode),
        this.dbh.escape(valObj.httpVersion),
        this.dbh.escape(valObj.contentType),
        valObj.date,
        valObj.tweet_id,
        valObj.index_of,
        valObj.resolve_index_of
        );
};

UnshortenWrapper.prototype.getInsertValuesSql = function (valObj) {
    return format(this.sqlTplInsertValues,
        valObj.tweet_id,
        valObj.index_of,
        valObj.resolve_index_of,
        this.dbh.escape(valObj.expanded_url),
        "'" + valObj.resolved + "'",
        this.dbh.escape(valObj.statuscode),
        this.dbh.escape(valObj.httpVersion),
        this.dbh.escape(valObj.contentType),
        valObj.date
        );
};
module.exports = UnshortenWrapper;