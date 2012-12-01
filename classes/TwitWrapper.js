/*jslint vars: true, node: true, indent: 4, maxlen: 80 */
/*properties
    ID, addListenersToStream, affRows, affectedRows, assemble,
    autoReConnectTimmer, compareSearchParams, connect, connectStream, dbQueryCB,
    dbh, delete, deleteCount, dir, emitted, endtime, errCount, escape, exports,
    follow, getLastQuery, getTime, isArray, join, length, limit, limitCount,
    locations, log, message, name, newStuff, newStuffCount, on, onDelete,
    onError, onLimit, onScrubGeo, onStatusWithheld, onTweet, onUserWithheld,
    onWarning, prototype, push, query, queryFollow, queryLocations, queryTrack,
    reReadSearchParamsTimer, readSearchParams, reconStats, reconnectStream,
    resetTwitterStatistic, round, scrubGeoCount, scrub_geo, stall_warnings,
    starttime, statisticsTimer, statitics, statusWithheldCount, status_withheld,
    stop, stream, stringify, stuffToTrack, toISOString, totalProcessed, track,
    tweetCount, tweetMsg, twit, userWithheldCount, user_withheld,
    waitForStuffFromDb, warning, warningCount
*/
var deleteNotice = require('../functions/deleteNotice');
var isArray = require('util').isArray;
var limitNotice = require('../functions/limitNotice');
var parseError = require('../functions/parseError');
var scrubGeoNotice = require('../functions/scrubGeoNotice');
var statusWithheldNotice = require('../functions/statusWithheldNotice');
var tweet = require('../functions/tweet');
var userWithheldNotice = require('../functions/userWithheldNotice');
var warningNotice = require('../functions/warningNotice');

function TwitWrapper(daTwit, daDbh) {
    'use strict';
    var that = this;
    this.dbh = daDbh;
    this.twit = daTwit;
    this.stuffToTrack = {
        track: '',
        follow: '',
        locations: ''
    };
    this.newStuff = {};
    this.newStuffCount = 0;
    this.stream = null;
    this.starttime = null;
    this.readSearchParams();
    this.reReadSearchParamsTimer = setInterval(
        function () {that.readSearchParams(); },
        600000
    );
    this.autoReConnectTimmer = setInterval(
        function () {that.reconnectStream(); },
        21600000
    );
    this.statisticsTimer = setInterval(
        function () {that.statitics(); },
        60000
    );
}

TwitWrapper.prototype.addListenersToStream = function () {
    'use strict';
    var that = this;
    this.stream.on('connect', console.dir);
    this.stream.on('disconnect', console.dir);
    this.stream.on('reconnect', function (req, response, connectInterval) {
        that.reconStats(req, response, connectInterval);
    });
    this.stream.on('error', function (err) {
        that.onError(err);
    });
    this.stream.on('delete', function (msg) {
        that.onDelete(msg);
    });
    this.stream.on('limit', function (msg) {
        that.onLimit(msg);
    });
    this.stream.on('scrub_geo', function (msg) {
        that.onScrubGeo(msg);
    });
    this.stream.on('status_withheld', function (msg) {
        that.onStatusWithheld(msg);
    });
    this.stream.on('tweet', function (msg) {
        that.onTweet(msg);
    });
    this.stream.on('user_withheld', function (msg) {
        that.onUserWithheld(msg);
    });
    this.stream.on('warning', function (msg) {
        that.onWarning(msg);
    });
};

TwitWrapper.prototype.assemble = function (err, resultRows, whatToAssemble) {
    'use strict';
    if (err) {
        throw err;
    }
    var i, len;
    var rs = [];
    len = resultRows.length;
    for (i = 0; i < len; i += 1) {
        rs.push(resultRows[i][whatToAssemble]);
    }
    this.newStuff[whatToAssemble] = rs.join(',');
    this.waitForStuffFromDb();
};

TwitWrapper.prototype.compareSearchParams = function () {
    'use strict';
    var now;
    var stuffChanged = false;
    if (this.stuffToTrack.track !== this.newStuff.track) {
        this.stuffToTrack.track = this.newStuff.track;
        stuffChanged = true;
    }
    if (this.stuffToTrack.follow !== this.newStuff.follow) {
        this.stuffToTrack.follow = this.newStuff.follow;
        stuffChanged = true;
    }
    if (this.stuffToTrack.locations !== this.newStuff.locations) {
        this.stuffToTrack.locations = this.newStuff.locations;
        stuffChanged = true;
    }
    this.newStuff = {};
    if (stuffChanged) {
        if (this.stream) {
            this.stream.stop();
        }
        this.resetTwitterStatistic();
        this.connectStream();
    } else {
        now = new Date();
        console.log("[" + now.toISOString() + "] Search parameters have not" +
            " changed. Next lookup in 10 minutes.");
    }
};


TwitWrapper.prototype.connectStream = function () {
    'use strict';
    var now;
    var tracking = {stall_warnings: "true"};
    var hasStuff = false;
    if (this.stuffToTrack.track) {
        tracking.track = this.stuffToTrack.track;
        hasStuff = true;
    }
    if (this.stuffToTrack.follow) {
        tracking.follow = this.stuffToTrack.follow;
        hasStuff = true;
    }
    if (this.stuffToTrack.locations) {
        tracking.locations = this.stuffToTrack.locations;
        hasStuff = true;
    }
    if (hasStuff) {
        this.stream = this.twit.stream('statuses/filter', tracking);
        this.addListenersToStream();
    } else {
        now = new Date();
        console.log("[" + now.toISOString() + "] nothing to search for." +
            " I am having 10 minutes break.");
    }
};

TwitWrapper.prototype.dbQueryCB = function (err, result) {
    'use strict';
    var i, len;
    if (err) {
        if (err.message ===
                'Connection lost: The server closed the connection.') {
            console.log(this.dbh.getLastQuery());
            this.dbh.connect();
        } else {
            throw err;
        }
    } else {
        this.totalProcessed += 1;
        if (isArray(result)) {
            len = result.length;
            for (i = 0; i < len; i += 1) {
                this.affRows += result[i].affectedRows;
            }
        } else {
            this.affRows += result.affectedRows;
        }
    }
};

TwitWrapper.prototype.onDelete = function (msg) {
    'use strict';
    var sql = deleteNotice(msg["delete"], this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.deleteCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onError = function (err) {
    'use strict';
    var that = this;
    var sql = parseError('null', that.dbh.escape(new Date()),
        that.dbh.escape(err.tweetMsg), that.dbh.escape(err.name),
        that.dbh.escape(err.message));
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    console.dir(err);
    this.errCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onLimit = function (msg) {
    'use strict';
    var sql = limitNotice(msg.limit, this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.limitCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onScrubGeo = function (msg) {
    'use strict';
    var sql = scrubGeoNotice(msg.scrub_geo, this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.scrubGeoCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onStatusWithheld = function (msg) {
    'use strict';
    var sql = statusWithheldNotice(msg.status_withheld, this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.statusWithheldCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onTweet = function (msg) {
    'use strict';
    var sql = 'START TRANSACTION;' + tweet(msg, this.dbh.escape, false) +
              'COMMIT;';
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.tweetCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onUserWithheld = function (msg) {
    'use strict';
    var sql = userWithheldNotice(msg.user_withheld, this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.userWithheldCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.onWarning = function (msg) {
    'use strict';
    var sql = warningNotice(msg.warning, this.dbh.escape);
    var that = this;
    this.dbh.query(sql, function (err, result) {
        that.dbQueryCB(err, result);
    });
    this.warningCount += 1;
    this.emitted += 1;
};

TwitWrapper.prototype.queryFollow = function () {
    'use strict';
    var sql = 'SELECT DISTINCT `wut_follow`.`follow`' +
              ' FROM `wut_follow`' +
              ' WHERE `wut_follow`.`follow` <> ""' +
              ' AND `wut_follow`.`begin` <= NOW()' +
              ' AND `wut_follow`.`end` >= NOW()' +
              ' ORDER BY `wut_follow`.`follow` ASC LIMIT 0, 5000;';
    var that = this;
    this.dbh.query(sql, function (err, resultRows) {
        that.assemble(err, resultRows, "follow");
    });
};

TwitWrapper.prototype.queryLocations = function () {
    'use strict';
    var sql = 'SELECT DISTINCT CONCAT( SW,  ",", NE ) AS locations' +
              ' FROM `wut_locations`' +
              ' WHERE `wut_locations`.`begin` <= NOW()' +
              ' AND `wut_locations`.`end` >= NOW()' +
              ' ORDER BY `wut_locations`.`begin` ASC LIMIT 0 , 25';
    var that = this;
    this.dbh.query(sql, function (err, resultRows) {
        that.assemble(err, resultRows, "locations");
    });
};

TwitWrapper.prototype.queryTrack = function () {
    'use strict';
    var sql = 'SELECT DISTINCT `wut_track`.`track` FROM `wut_track`' +
              ' WHERE `wut_track`.`track` <> ""' +
              ' AND `wut_track`.`begin` <= NOW()' +
              ' AND `wut_track`.`end` >= NOW()' +
              ' ORDER BY `wut_track`.`track` ASC LIMIT 0, 400;';
    var that = this;
    this.dbh.query(sql, function (err, resultRows) {
        that.assemble(err, resultRows, "track");
    });
};

TwitWrapper.prototype.readSearchParams = function () {
    'use strict';
    this.queryFollow();
    this.queryLocations();
    this.queryTrack();
};

TwitWrapper.prototype.reconStats = function (req, response, connectInterval) {
    'use strict';
    var now = new Date();
    console.log("[" + now.toISOString() + "] conInterval" + connectInterval);
    console.dir(req);
    console.dir(response);
};

TwitWrapper.prototype.reconnectStream = function () {
    'use strict';
    this.stream.stop();
    this.resetTwitterStatistic();
    this.connectStream();
};

TwitWrapper.prototype.resetTwitterStatistic = function () {
    'use strict';
    var log = {};
    if (!this.starttime) {
        this.starttime = new Date();
    } else {
        this.endtime = new Date();
        log.ID = null;
        log.starttime = this.starttime;
        log.endtime = this.endtime;
        log.affRows = this.affRows;
        log.deleteCount = this.deleteCount;
        log.emitted = this.emitted;
        log.errCount = this.errCount;
        log.limitCount = this.limitCount;
        log.scrubGeoCount = this.scrubGeoCount;
        log.statusWithheldCount = this.statusWithheldCount;
        log.totalProcessed = this.totalProcessed;
        log.tweetCount = this.tweetCount;
        log.userWithheldCount = this.userWithheldCount;
        log.warningCount = this.warningCount;
        log.stuffToTrack = JSON.stringify(this.stuffToTrack);
        // Direct DB-Call for Object maping to key = 'value' in SET part.
        this.dbh.dbh.query('INSERT INTO wut_stream_statistics SET ?',
            log,
            function (err) {
                if (err) {
                    console.log(this.dbh.getLastQuery());
                    throw err;
                }
            });
        this.statitics();
        this.starttime = new Date();
    }
    this.affRows = 0;
    this.deleteCount = 0;
    this.emitted = 0;
    this.errCount = 0;
    this.limitCount = 0;
    this.scrubGeoCount = 0;
    this.statusWithheldCount = 0;
    this.totalProcessed = 0;
    this.tweetCount = 0;
    this.userWithheldCount = 0;
    this.warningCount = 0;
};

TwitWrapper.prototype.statitics = function () {
    'use strict';
    var now, elSec, readPerSecond, procPerSecond;
    var noticeMsg = '\n[%s] twitParserEmitted(%d)' +
        '\nincomingPerSecond(%d) processedPerSecond(%d) affectedRows(%d)' +
        '\ntotalProcessed(%d):' +
        '\ntweets(%d) errors(%d) delMsg(%d) limitMsgs(%d)' +
        '\nscrubGeo(%d) sWitheld(%d) uWitheld(%d) warnings(%d)\n';
    now = new Date();
    elSec = (now.getTime() - this.starttime.getTime()) / 1000;
    procPerSecond = Math.round((this.totalProcessed / elSec) * 1000) / 1000;
    readPerSecond = Math.round((this.emitted / elSec) * 1000) / 1000;
    console.log(noticeMsg,
        now.toISOString(),
        this.emitted,
        readPerSecond,
        procPerSecond,
        this.affRows,
        this.totalProcessed,
        this.tweetCount,
        this.errCount,
        this.deleteCount,
        this.limitCount,
        this.scrubGeoCount,
        this.statusWithheldCount,
        this.userWithheldCount,
        this.warningCount);
};

TwitWrapper.prototype.waitForStuffFromDb = function () {
    'use strict';
    this.newStuffCount += 1;
    if (this.newStuffCount < 3) {
        return;
    }
    this.newStuffCount = 0;
    this.compareSearchParams();
};

module.exports = TwitWrapper;