/*properties
    code, exports, format, message, percent_full
*/
var format = require('util').format,
    /**
     * SQL-Statement template for warningNotice
     * @type {string}
     */
    insWarning = 'INSERT IGNORE INTO wut_warnings (timestamp, code, message,' +
        ' percent_full) VALUES (NOW(), %s, %s, %s);';
/**
 * Returns the SQL-Statement for storing the Twitter.warning notice
 * @author Kai koch
 * @function
 * @param {object} warn Content of the Twitter.warning message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Statement to store the warningNotice as SQL-Escaped
 *     string
 */
function warningNotice(warn, sqlEscFunc) {
    'use strict';
    return format(insWarning, sqlEscFunc(warn.code), sqlEscFunc(warn.message),
        sqlEscFunc(warn.percent_full));
}
module.exports = warningNotice;