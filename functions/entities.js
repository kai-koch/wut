/*properties
    display_url, expanded_url, exports, format, hashtags, id_str, indices,
    isArray, join, length, media, name, push, screen_name, text, url, urls,
    user_mentions
*/
var format = require('util').format,
    isArray = require('util').isArray,
    media = require('./media'),
    /**
     * Static String template for VALUES of the INSERT-statement
     * @type {string}
     */
    insHashtagsValues = '(%s, %d, %d, %d, %s)',
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insUrlsValues = '(%s, %d, %s, %s, %d, %d, %s)',
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insUserMentionedValues = '(%s, %d, %s, %d, %d, %s, %s)',
    /**
     * Static String template for the INSERT-statement
     * @type {string}
     */
    insHashtags = 'INSERT INTO wut_hashtags (tweet_id, index_of,' +
        ' x1, x2, text) VALUES %s ON DUPLICATE KEY UPDATE x1=VALUES(x1),' +
        ' x2=VALUES(x2), text=VALUES(text);',
    /**
     * Static String template for the INSERT-statement
     * @type {string}
     */
    insUrls = 'INSERT INTO wut_urls (tweet_id, index_of, display_url,' +
        ' expanded_url, x1, x2, url) VALUES %s ON DUPLICATE KEY UPDATE ' +
        'display_url=VALUES(display_url), expanded_url=VALUES(expanded_url),' +
        ' x1=VALUES(x1), x2=VALUES(x2), url=VALUES(url);',
    /**
     * Static string template INSERT-statements for the Media Object
     * @type {string}
     */
    insUserMentioned = 'INSERT INTO wut_user_mentions (tweet_id, index_of,' +
        ' id, x1, x2, name, screen_name) VALUES %s ON DUPLICATE KEY UPDATE ' +
        'id=VALUES(id), x1=VALUES(x1), x2=VALUES(x2), name=VALUES(name),' +
        ' screen_name=VALUES(screen_name);';
/**
 * Returns the VALUES for INSERT-statement of the hashtag object
 * @param {string} tweet_id id of the parrent Tweet. SQL-escaped
 * @param {number} index_of Index of the Apperance in the tweet
 * @param {object} hshtg represent a single hashtags which have been parsed
 *     out of the Tweet text.
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function hashtag(tweet_id, index_of, hshtg, sqlEscFunc) {
    'use strict';
    return format(insHashtagsValues, tweet_id, index_of, hshtg.indices[0],
        hshtg.indices[1], sqlEscFunc(hshtg.text));
}

/**
 * Returns the Values for the INSERT-statements of the url object
 * @param {string} tweet_id id of the parrent Tweet. SQL-escaped
 * @param {number} index_of Index of the Apperance in the tweet
 * @param {object} uri represent a single url which have been parsed
 *     out of the Tweet text.
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function url(tweet_id, index_of, uri, sqlEscFunc) {
    'use strict';
    if (!uri.display_url) {
        uri.display_url = uri.url;
    }
    if (!uri.expanded_url) {
        uri.expanded_url = uri.url;
    }
    if (!uri.url) {
        return '';
    }
    return format(insUrlsValues, tweet_id, index_of,
        sqlEscFunc(uri.display_url), sqlEscFunc(uri.expanded_url),
        uri.indices[0], uri.indices[1], sqlEscFunc(uri.url));
}
/**
 * Returns the Values for the REPLACE-statement of the url object
 * @param {string} tweet_id id of the parrent Tweet. SQL-escaped
 * @param {number} index_of Index of the Apperance in the tweet
 * @param {object} umen user_mentioned object
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function user_mention(tweet_id, index_of, umen, sqlEscFunc) {
    'use strict';
    return format(insUserMentionedValues, tweet_id, index_of,
        sqlEscFunc(umen.id_str), umen.indices[0], umen.indices[1],
        sqlEscFunc(umen.name), sqlEscFunc(umen.screen_name));
}
/**
 * Returns a <b>multiline</b> SQL-statement to store the entities into the
 * Database
 * @param {object} enti entity object from JSON
 * @param {string} tweet_id id of the parrent Tweet SQL-escaped
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function entities(enti, tweet_id, sqlEscFunc) {
    'use strict';
    var i, len, sqlStatemnts = [], statementCount = 0,
        /**
         * Array of Hashtags objects SQL-strings, that represents hashtags in
         * the text of the Tweet.
         * @type {Array}
         */
        hashtags = [],
        hashtagsCount = 0,
        /**
         * SQL-string, that represents media in the text of the Tweet.
         * @type {string}
         */
        medias = '',
        /**
         * Array of Url objects SQL-strings, that represents urls in the text of
         * the Tweet.
         * @type {Array}
         */
        urls = [],
        urlsCount = 0,
        /**
         * Array of User_mention Objects SQL-strings, that represents other
         * Twitter users mentioned in the text of the Tweet.
         * @type {Array}
         */
        user_mentions = [],
        user_mentionsCount = 0;
    if (enti.hashtags !== undefined && isArray(enti.hashtags)) {
        len = enti.hashtags.length;
        for (i = 0; i < len; i += 1) {
            hashtagsCount = hashtags.push(hashtag(tweet_id, i, enti.hashtags[i],
                sqlEscFunc));
        }
    }
    if (enti.media !== undefined && isArray(enti.media)) {
        medias = media(tweet_id, enti.media, sqlEscFunc);
    }
    if (enti.urls !== undefined && isArray(enti.urls)) {
        len = enti.urls.length;
        for (i = 0; i < len; i += 1) {
            urlsCount = urls.push(url(tweet_id, i, enti.urls[i], sqlEscFunc));
        }
    }
    if (enti.user_mentions !== undefined && isArray(enti.user_mentions)) {
        len = enti.user_mentions.length;
        for (i = 0; i < len; i += 1) {
            user_mentionsCount = user_mentions.push(user_mention(tweet_id, i,
                enti.user_mentions[i], sqlEscFunc));
        }
    }
    if (hashtagsCount) {
        statementCount = sqlStatemnts.push(format(insHashtags,
            hashtags.join(',')));
    }
    if (medias) {
        statementCount = sqlStatemnts.push(medias);
    }
    if (urlsCount) {
        statementCount = sqlStatemnts.push(format(insUrls, urls.join(',')));
    }
    if (user_mentionsCount) {
        statementCount = sqlStatemnts.push(format(insUserMentioned,
            user_mentions.join(',')));
    }
    if (statementCount) {
        return sqlStatemnts.join('\n');
    }
    return '';
}
module.exports = entities;