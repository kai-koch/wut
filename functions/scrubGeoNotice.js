/*properties
    exports, format, up_to_status_id_str, user_id_str
*/
var format = require('util').format,
    /**
     * SQL-Statement template for scrubGeoNotice function
     * @type {string}
     */
    insScrubGeo = 'INSERT INTO wut_scrub_geo (user_id, up_to_status_id,' +
        ' executed) VALUES (%s,%s,"false") ON DUPLICATE KEY UPDATE' +
        ' executed="false";';
/**
 * Returns the SQL-Statement for storing the scrubGeo notice
 * @author Kai koch
 * @function
 * @param {object} scrubG Content of the Twitter["scrub_geo"] message
 * @param {function} sqlEscFunc SQL-escape function usually from the connection
 *      object
 * @return {string} SQL-Escaped String
 */
function scrubGeoNotice(scrubG, sqlEscFunc) {
    'use strict';
    return format(insScrubGeo, sqlEscFunc(scrubG.user_id_str),
        sqlEscFunc(scrubG.up_to_status_id_str));
}
module.exports = scrubGeoNotice;