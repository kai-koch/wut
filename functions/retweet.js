/*jslint node: true, indent: 4, maxlen: 80 */
/*properties
    exports, format
*/
var format = require('util').format,
    /**
     * SQL-Statement template for retweets
     * @type {string}
     */
    insRetweets = 'INSERT IGNORE INTO wut_retweets VALUES (%s,%s);';
/**
 * Returns the SQL-Statement for storing the re-tweet-&gt;tweet relation
 * @author Kai koch
 * @function
 * @param {string} tweet_id String representation of the id of the re-tweet
 * @param {string} retweet_of String representation of the id of original tweet
 * @return {string} SQL-Statement to store the tweet-&gt;re-tweet relation
 */
function retweet(tweet_id, retweet_of) {
    'use strict';
    return format(insRetweets, tweet_id, retweet_of);
}
module.exports = retweet;