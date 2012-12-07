/*jslint node: true, indent: 4, maxlen: 80 */
/*properties
    NAMES, character_set_client, character_set_connection, character_set_obj,
    character_set_results, character_set_sql_tpl, code, connect,
    createConnection, database, dbconfig, dbh, destroy, end, escape,
    execSetConnectionCharsets, exports, fatal, format, getLastQuery, host, log,
    on, onDBerror, prototype, query, reconnectCallback, setCharacterSet, sql,
    stack, user
*/
var mysql = require('mysql');
var format = require('util').format;

/**
 * Class that opens and wraps the MySQL-Connection and handles disconnects
 * automaticly.
 * @param {object} dbconfig Configuration object e.g. {host: 'localhost', user:
 * 'me', password: 'secret', database: 'testDB'}
 * @requires mysql See https://github.com/felixge/node-mysql
 * @throws {error} All errors created by this module are instances of the
 * JavaScript Error object. Additionally they come with two properties:<br>
 * err.code: Either a MySQL server error (e.g. 'ER_ACCESS_DENIED_ERROR'),
 * a node.js error (e.g. 'ECONNREFUSED') or an internal error (e.g.
 * 'PROTOCOL_CONNECTION_LOST').<br> err.fatal: Boolean, indicating if this error
 * is terminal to the connection object.
 * @class
 * @constructor
 * @author Kai Koch
 * @public
 */
function DbWrapper(dbconfig) {
    'use strict';
    this.dbconfig = dbconfig;
    this.dbh = null;
    this.character_set_obj = {
        character_set_client: 'utf8mb4',
        character_set_connection: 'utf8mb4',
        character_set_results: 'utf8mb4',
        NAMES: 'utf8mb4'
    };
    this.escape = null;
    this.connect();
}

/**
 * @type {string} SQL-Template for setting connection charsets
 */
DbWrapper.prototype.character_set_sql_tpl = "SET character_set_client='%s';" +
    "SET character_set_connection='%s';SET character_set_results='%s';" +
    "SET NAMES %s;";
/**
 * Opens an new connection to the host and database given in the dbconfig.
 * @throws {error} JavaScript error
 */
DbWrapper.prototype.connect = function dbhConnect() {
    'use strict';
    var that = this;
    this.dbh = mysql.createConnection(this.dbconfig);
    this.dbh.on('error', function (err) {
        that.reconnectCallback(err);
    });
    this.dbh.connect(function (err) {
        that.onDBerror(err);
    });
    this.execSetConnectionCharsets();
// for mysql@2.0.0-alpha3 and below
// the old way: escape was bound to the connection object
//    this.escape = this.dbh.escape;

// for mysql@2.0.0-alpha4 and above
// the new way: the escape function is bound directly to the mysql-object
    this.escape = mysql.escape;
    console.log(format('Connected to database: %s on host: %s as user: %s',
        this.dbconfig.database,
        this.dbconfig.host,
        this.dbconfig.user));
};

/**
 * This will cause an immediate termination of the underlying socket.
 * Additionally destroy() guarantees that no more events or callbacks will be
 * triggered for the connection.
 */
DbWrapper.prototype.destroy = function dbhDestroy() {
    'use strict';
    this.dbh.destroy();
};

/**
 * This will make sure all previously enqueued queries are still executed before
 * sending a COM_QUIT packet to the MySQL server.<br>
 * If a fatal error occurs before the COM_QUIT packet can be sent, an err
 * argument will be provided to the callback, but the connection will be
 * terminated regardless of that.
 * @param {function} [callback] optional callback, if the callback is omitted
 * the default .onDBerror handler of this class will be used
 */
DbWrapper.prototype.end = function dbhEnd(callback) {
    'use strict';
    callback = callback || this.onDBerror;
    this.dbh.end(callback);
};

/**
 * Parses the character_set_sql_tpl using the parameters character_set_obj and
 * executes the SQL-Command
 * @public
 */
DbWrapper.prototype.execSetConnectionCharsets = function setConCharsets() {
    'use strict';
    var sql = format(this.character_set_sql_tpl,
        this.character_set_obj.character_set_client,
        this.character_set_obj.character_set_connection,
        this.character_set_obj.character_set_results,
        this.character_set_obj.NAMES);
    this.dbh.query(sql, this.onDBerror);
};

/**
 * Get the last SQL-Query that was executed as string
 * @return {string}
 * @public
 */
DbWrapper.prototype.getLastQuery = function dbhGetLastQuery() {
    'use strict';
    var sql;
    try {
        sql = this.dbh.query.sql;
    } catch (e) {
        sql = 'dbh.query.sql not defined!';
    }
    return sql;
};

/**
 * Default callback function thrown if an database error occures
 * @param {error} [err] JavaScript error
 * @throws {error} JavaScript error
 */
DbWrapper.prototype.onDBerror = function throwDbError(err) {
    'use strict';
    if (err) {
        throw err;
    }
};

/**
 * Queues the given and already escaped SQL-String for execution. Calls the
 * given callback function with (err, rows, fields) when the SQL-string has been
 * executed.
 * @param {string} sql
 * @param {function} callback
 * @public
 */
DbWrapper.prototype.query = function dbhQuery(sql, callback) {
    'use strict';
    this.dbh.query(sql, callback);
};

/**
 * Callback for connection.on('error', ...) emitter.
 * If the error is not fatal, it simply returns to let the error be handled by
 * the corrosponding query handler.<br>
 * If error.code is not 'PROTOCOL_CONNECTION_LOST' throws the error else
 * it creates a new connection.
 * @param {error} err JavaScript error
 * @throws {error} JavaScript error
 */
DbWrapper.prototype.reconnectCallback = function reconnectCallback(err) {
    'use strict';
    if (!err.fatal) {
        return;
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
        throw err;
    }
    console.log('Re-connecting lost database connection: ' + err.stack);
    this.connect();
};

/**
 * Overrides the default character_set_obj used in .execSetConnectionCharsets()
 * <br>Example:<br>
 * {character_set_client: 'utf8mb4',character_set_connection: 'utf8mb4',
 * character_set_results: 'utf8mb4',NAMES: 'utf8mb4'}
 * @param {object} [paramObj] character_set object. the default is used if
 * omitted
 */
DbWrapper.prototype.setCharacterSet = function setCharacterSet(paramObj) {
    'use strict';
    this.character_set_obj = paramObj || {character_set_client: 'utf8mb4',
        character_set_connection: 'utf8mb4', character_set_results: 'utf8mb4',
        NAMES: 'utf8mb4'};
};

module.exports = DbWrapper;