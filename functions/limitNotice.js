/*properties
    exports, format, track
*/
var format = require('util').format,
    /**
     * SQL-Statement template for LimitNotice
     * @type {string} *
     */
    insLimit = 'INSERT IGNORE INTO wut_limit VALUES (NOW(),%s,"false");';
/**
 * Returns the SQL-Statement for storing the Twitter.limit notice
 * @author Kai koch
 * @function
 * @param {object} limNote Content of the Twitter.limit message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Statement to store the LimitNotice as SQL-Escaped string
 */
function limitNotice(limNote, sqlEscFunc) {
    'use strict';
    return format(insLimit, sqlEscFunc(limNote.track));
}
module.exports = limitNotice;