/*properties
    display_url, expanded_url, exports, format, h, hasOwnProperty, id_str,
    indices, join, lenght, length, media_url, media_url_https, push,
    resize, sizes, source_status_id_str, type, url, w
*/
var format = require('util').format,
    isArray = require('util').isArray,
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insMediaSizesValues = '(%s, %s, %d, %d, %s)',
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insMediaSizes = 'INSERT INTO wut_media_sizes (media_id, size,' +
        ' h, w, resize) VALUES %s ON DUPLICATE KEY UPDATE size=VALUES(size),' +
        ' h=VALUES(h), w=VALUES(w), resize=VALUES(resize);',
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insTweetMediaValues = '(%s, %d, %s)',
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insTweetMedia = 'INSERT IGNORE INTO wut_tweet_media (tweet_id, index_of,' +
        ' media_id) VALUES %s;',
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insMediaValue = '(%s, %s, %s, %d, %d, %s, %s, %s, %s, %s)',
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insMedia = 'INSERT INTO wut_media (id, display_url, ' +
        'expanded_url, x1, x2, media_url, media_url_https, source_status_id, ' +
        'type, url) VALUES %s ' +
        'ON DUPLICATE KEY UPDATE display_url=VALUES(display_url), ' +
        'expanded_url=VALUES(expanded_url), x1=VALUES(x1), x2=VALUES(x2), ' +
        'media_url=VALUES(media_url), media_url_https=VALUES(media_url_https)' +
        ', source_status_id=VALUES(source_status_id), type=VALUES(type),' +
        ' url=VALUES(url);';
/**
 * Returns the value part of the INSERT-statement
 * @param {string} media_id Sql-escaped string with the media id
 * @param {string} sz Sql-escaped size of the media object 'thumb', 'large',
 *     'medium', 'small'
 * @param {object} sizeObj Object with size data
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function size(media_id, sz, sizeObj, sqlEscFunc) {
    'use strict';
    return format(insMediaSizesValues, media_id, sz, sizeObj.h, sizeObj.w,
        sqlEscFunc(sizeObj.resize));
}


/**
 * Returns the SQL-Statements for the Media Objects and their children.<br>
 * Represents media elements uploaded with the Tweet.<br>
 * Example: [{"type":"photo", "sizes":{"thumb":{"h":150, "resize":"crop",
 *   "w":150}, "large":{"h":238, "resize":"fit", "w":226}, "medium":{"h":238,
 *   "resize":"fit", "w":226}, "small":{"h":238, "resize":"fit", "w":226}},
 *   "indices":[15,35], "url":"http:\/\/t.co\/rJC5Pxsu",
 *   "media_url":"http:\/\/p.twimg.com\/AZVLmp-CIAAbkyy.jpg",
 *   "display_url":"pic.twitter.com\/rJC5Pxsu", "id":114080493040967680,
 *   "id_str":"114080493040967680","expanded_url":
 *   "http:\/\/twitter.com\/yunorno\/status\/114080493036773378\/photo\/1",
 *   "media_url_https":"https:\/\/p.twimg.com\/AZVLmp-CIAAbkyy.jpg"}]
 * @param {array} md Array of media objects
 * @param {string} tweet_id id of the parrent Tweet. SQL-escaped
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function media(tweet_id, md, sqlEscFunc) {
    'use strict';
    var i, j, len,
        /**
         * Accumulator for Media-objects SQL and Child-Objects SQL
         * @type {array}
         */
        rows = [],
        /**
         * ID of the media expressed as a string. Example: "114080493040967680"
         * @type {string}
         */
        id_str = '',
        /**
         * An array of Sql-strings for the sizes of the media file.<br>
         * Example:{"thumb":{"h":150,"resize":"crop","w":150},"large":{
         * "h":238,"resize":"fit","w":226},"medium":{"h":238,"resize":"fit",
         * "w":226},"small":{"h":238,"resize":"fit","w":226}}
         * @type {array}
         */
        sizes = [],
        /**
         * An array of SQL-VALUE-strings for the media array.
         * @type {array}
         */
        mediaValues = [],
        /**
         * An array of SQL-VALUE-strings for the table wut_tweet_media.
         * @type {array}
         */
        tweetMediaValues = [];
    if(isArray(md)) {
        len = md.length;
    } else {
        console.log("media not an array!");
        console.dir(md);
        return '';
    }
    for (i = 0; i < len; i += 1) {
        id_str = sqlEscFunc(md[i].id_str);
        tweetMediaValues.push(format(insTweetMediaValues, tweet_id, i, id_str));
        mediaValues.push(format(insMediaValue, id_str,
            sqlEscFunc(md[i].display_url), sqlEscFunc(md[i].expanded_url),
            md[i].indices[0], md[i].indices[1], sqlEscFunc(md[i].media_url),
            sqlEscFunc(md[i].media_url_https),
            sqlEscFunc(md[i].source_status_id_str), sqlEscFunc(md[i].type),
            sqlEscFunc(md[i].url)));
        for (j in md[i].sizes) {
            if (md[i].sizes.hasOwnProperty(j)) {
                sizes.push(size(id_str, sqlEscFunc(j), md[i].sizes[j],
                    sqlEscFunc));
            }
        }
    }
    if (tweetMediaValues.length) {
        rows.push(format(insTweetMedia, tweetMediaValues.join(',')));
    }
    if (mediaValues.length) {
        rows.push(format(insMedia, mediaValues.join(',')));
    }
    if (sizes.length) {
        rows.push(format(insMediaSizes, sizes.join(',')));
    }
    return rows.join('\n');
}
module.exports = media;