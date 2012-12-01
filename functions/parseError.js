/*properties
    exports, format
*/
var format = require('util').format,
    /**
     * SQL INSERT Statement template
     * @type {string}
     */
    insParseError = 'INSERT INTO wut_parser_errors (id, timestamp, chunk,' +
        ' error_type, error_message) VALUES (%s, %s, %s, %s, %s)' +
        ' ON DUPLICATE KEY UPDATE timestamp=VALUES(timestamp),' +
        ' chunk=VALUES(chunk), error_type=VALUES(error_type),' +
        ' error_message=VALUES(error_message);';
/**
 * Returns the SQL-Statement for storing the error
 * @author Kai koch
 * @function
 * @param {string} id Id from the Source Table
 * @param {string} timestamp timestamp when the status was recevied
 * @param {string} chunk SQL-escaped chunk that could not be parsed
 * @param {string} error_type SQL-Escaped type of error (err.name)
 * @param {string} error_msg SQL-Escaped message from error (err.message)
 * @return {string} SQL-Escaped String
 */
function parseError(id, timestamp, chunk, error_type, error_msg) {
    'use strict';
    return format(insParseError, id, timestamp, chunk, error_type, error_msg);
}
module.exports = parseError;