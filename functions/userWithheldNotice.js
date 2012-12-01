/*properties
    exports, format, id_str, join, withheld_in_countries
*/
var format = require('util').format,
    /**
     * SQL-Statement template for statusWithheldNotice function
     * @type {string}
     */
    insUserWithheld = 'INSERT INTO wut_user_withheld (user_id,' +
        ' withheld_in_countries, processed) VALUES (%s,%s,"false")' +
        ' ON DUPLICATE KEY UPDATE' +
        ' withheld_in_countries=VALUES(withheld_in_countries),' +
        ' processed="false";';
/**
 * Returns the SQL-Statement for storing the Twitter.user_withheld notice
 * @author Kai koch
 * @function
 * @param {object} withheld Content of the Twitter.user_withheld message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Statement to store the userWithheldNotice as
 *     SQL-Escaped string
 */
function userWithheldNotice(withheld, sqlEscFunc) {
    'use strict';
    return format(insUserWithheld, sqlEscFunc(withheld.id_str),
        sqlEscFunc(withheld.withheld_in_countries.join(',')));
}
module.exports = userWithheldNotice;