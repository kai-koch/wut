/*properties
    exports, format, id_str, join, user_id_str, withheld_in_countries
*/
var format = require('util').format,
    /**
     * SQL-Statement template for statusWithheldNotice function
     * @type {string}
     */
    insStatusWithheld = 'INSERT INTO wut_status_withheld (tweet_id, user_id,' +
        ' withheld_in_countries, processed) VALUES (%s, %s, %s, "false")' +
        ' ON DUPLICATE KEY UPDATE' +
        ' withheld_in_countries=VALUES(withheld_in_countries),' +
        ' processed=VALUES(processed);';
/**
 * Returns the SQL-Statement for storing the Twitter.status_withheld notice
 * @author Kai koch
 * @function
 * @param {object} withheld Content of the Twitter.status_withheld message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Statement to store the statusWithheldNotice as
 *     SQL-Escaped string
 */
function statusWithheldNotice(withheld, sqlEscFunc) {
    'use strict';
    return format(insStatusWithheld, sqlEscFunc(withheld.id_str),
        sqlEscFunc(withheld.user_id_str),
        sqlEscFunc(withheld.withheld_in_countries.join(',')));
}
module.exports = statusWithheldNotice;