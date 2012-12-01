/*properties
    exports, format, id_str, status, user_id_str
*/
var format = require('util').format,
    /**
     * SQL INSERT Statement template
     * @type {string}
     */
    insDelete = 'INSERT INTO wut_delete (id, user_id, executed) VALUES ' +
         '(%s, %s, "false") ON DUPLICATE KEY UPDATE executed="false";';
/**
 * Returns the SQL-Statement for storing the delete notice
 * @author Kai koch
 * @function
 * @param {object} delMsg Content of the Twitter["delete"] message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Escaped String
 */
function deleteNotice(delMsg, sqlEscFunc) {
    'use strict';
    return format(insDelete,
        sqlEscFunc(delMsg.status.id_str),
        sqlEscFunc(delMsg.status.user_id_str));
}
module.exports = deleteNotice;