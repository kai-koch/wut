/*jslint node: true, indent: 4, maxlen: 80 */
/*properties
    annotations, contributors, coordinates, created_at, current_user_retweet,
    entities, exports, favorite_count, favorited, filter_level, format, geo, id,
    id_str, in_reply_to_screen_name, in_reply_to_status_id,
    in_reply_to_status_id_str, in_reply_to_user_id, in_reply_to_user_id_str,
    isArray, join, lang, length, place, placeId, possibly_sensitive,
    possibly_sensitive_editable, push, retweet_count, retweeted,
    retweeted_status, scopes, screen_name, source, stringify, text, truncated,
    type, user, userId, withheld_copyright, withheld_in_countries,
    withheld_scope
*/
var format = require('util').format,
    isArray = require('util').isArray,
    entities = require('./entities'),
    place = require('./place'),
    user = require('./user'),
    /**
     * The VALUE template for the INSERT SQL-statement
     * @type {string}
     */
    insContributorsValues = "(%s, %s, %s)",
    /**
    * Template of the INSERT Statement to store this object
    * @type {string}
    */
    insContributors = 'INSERT INTO wut_contributors (tweet_id, user_id,' +
        ' screen_name) VALUES %s ON DUPLICATE KEY UPDATE' +
        ' screen_name=VALUES(screen_name);',
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insGeoObjects = 'INSERT INTO wut_geo_objects (tweet_id, type) VALUES (%s,' +
        ' %s) ON DUPLICATE KEY UPDATE type=VALUES(type);',
    /**
     * Static string template for the VALUES part of the INSERT-statement
     * @type {string}
     */
    insGeoObjectsCoordinatesValue = '(%s, %d, %d, %d)',
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insGeoObjectsCoordinates = 'INSERT INTO wut_geo_objects_coordinates' +
        ' (tweet_id, index_of, longitude, latitude) VALUES %s ON DUPLICATE' +
        ' KEY UPDATE longitude=VALUES(longitude), latitude=VALUES(latitude);',
    /**
     * Static string template for the INSERT-statement of the Tweet
     * @type {string}
     */
    insTweets = 'INSERT INTO wut_tweets (id, annotations, created_at,' +
        ' current_user_retweet, favorite_count, favorited, filter_level, geo,' +
        ' in_reply_to_screen_name,' +
        ' in_reply_to_status_id, in_reply_to_user_id, lang, place,' +
        ' possibly_sensitive, possibly_sensitive_editable,' +
        ' scopes, retweet_count, retweeted, source, text, truncated, user,' +
        ' withheld_copyright, withheld_in_countries, withheld_scope) VALUES' +
        ' (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,' +
        ' %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE' +
        ' annotations=VALUES(annotations), created_at=VALUES(created_at),' +
        ' current_user_retweet=VALUES(current_user_retweet),' +
        ' favorite_count=VALUES(favorite_count),' +
        ' favorited=VALUES(favorited), geo=VALUES(geo),' +
        ' filter_level=VALUES(filter_level),' +
        ' in_reply_to_screen_name=VALUES(in_reply_to_screen_name),' +
        ' in_reply_to_status_id=VALUES(in_reply_to_status_id),' +
        ' in_reply_to_user_id=VALUES(in_reply_to_user_id),' +
        ' lang=VALUES(lang),' +
        ' place=VALUES(place), possibly_sensitive=VALUES(possibly_sensitive),' +
        ' possibly_sensitive_editable=VALUES(possibly_sensitive_editable),' +
        ' scopes=VALUES(scopes), retweet_count=VALUES(retweet_count),' +
        ' retweeted=VALUES(retweeted), source=VALUES(source),' +
        ' text=VALUES(text), truncated=VALUES(truncated), user=VALUES(user),' +
        ' withheld_copyright=VALUES(withheld_copyright),' +
        ' withheld_in_countries=VALUES(withheld_in_countries),' +
        ' withheld_scope=VALUES(withheld_scope);',
    /**
     * Static string template for the INSERT-statement for unknown objects
     * in the Tweet
     * @type {string}
     */
    insUnknownTweetObjs = 'INSERT INTO wut_unknown_tweet_objs (tweet_id,' +
        ' timestamp, unknown) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE' +
        ' timestamp=VALUES(timestamp), unknown=VALUES(unknown);';

/**
 * Returns an SQL-statement INSERT from the Contributors object.<br>
 * Nullable. An collection of brief user objects (usually only one) indicating
 * users who contributed to the authorship of the tweet, on behalf of the
 * official tweet author.
 * @param {object} cont content of the contributors collection from the Tweet
 * @param {string} tweet_id id of the parrent Tweet SQL-escaped
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function contributors(cont, tweet_id, sqlEscFunc) {
    'use strict';
    var i, len, values = [], valuesCount = 0,
    /**
     * A collection of the contributing users usually just one
     * @type {array}
     */
        contributs = [];
    if (isArray(cont)) {
        len = cont.length;
        for (i = 0; i < len; i += 1) {
            if (cont[i].id_str) {
                contributs.push({
                    id_str: sqlEscFunc(cont[i].id_str),
                    screen_name: sqlEscFunc(cont[i].screen_name)
                });
            }
        }
    }
    len = contributs.length;
    for (i = 0; i < len; i += 1) {
        valuesCount = values.push(format(insContributorsValues,
            tweet_id,
            contributs[i].id_str,
            contributs[i].screen_name));
    }
    if (valuesCount) {
        return format(insContributors, values.join(','));
    }
    return '';
}

/**
 * Returns the INSERT - statements for the Coordinates Object
 * @param {object} coor
 * @param {string} tweet_id id of the parrent Tweet SQL-escaped
 * @param {function} sqlEscFunc Function used to escape values for
 *     SQL-statements, usually the connection.escape() function
 * @return {string}
 * @author Kai Koch
 */
function coordinates(coor, tweet_id, sqlEscFunc) {
    'use strict';
    var i = 0, len = 0, values = [], valuesCount = 0, sql = [],
        /**
         * The longitude and latitude of the Tweet's location, as an collection
         * of floats in the form of [longitude, latitude].<br>
         * Example:<br>
         * Type:"Point" [[ [-122.400612831116,37.7821120598956] ]]<br>
         * Type:"Polygon" [[[-77.119759,38.791645],[-76.909393,38.791645],
         *     [-76.909393,38.995548],[-77.119759,38.995548]]]
         * @type {array}
         */
        coords = [],
        /**
         * The type of data encoded in the coordinates property. This will be
         * "Point" for Tweet coordinates fields.
         * See also @link http://www.geojson.org/
         * @type {string}
         */
        type = '';
    if (coor !== null) {
        type = sqlEscFunc(coor.type);
        switch (coor.type) {
        case "Point":
            // Bring Point Coordinates in line with other Coordinate types
            coords = [[coor.coordinates]];
            break;
        case "Polygon":
            coords = coor.coordinates;
            break;
        default:
            coords = coor.coordinates;
        }
    }
    sql.push(format(insGeoObjects,
        tweet_id,
        type));
    len = coords[0].length;
    for (i = 0; i < len; i += 1) {
        valuesCount = values.push(format(insGeoObjectsCoordinatesValue,
            tweet_id,
            i,
            coords[0][i][0],
            coords[0][i][1]));
    }
    if (valuesCount) {
        sql.push(format(insGeoObjectsCoordinates, values.join(',')));
    }
    return sql.join('\n');
}

/**
 * Returns SQL-statements from the Tweet object and all its child objects as
 * multi line SQL-string.<br>
 * Does not use the int64 id-fields of any Twitter-object since JavaScript can't
 * handle int64 values, uses always [attribute_]id_str instead. <br>
 * see: dev.twitter.com/docs/platform-objects/tweets
 * @param {object} t the JSON-object representing the tweet
 * @param {function} sqlEscFunc Reference to the function used to escape values
 *      for SQL-statements, usually the connection.escape() function
 * @param {boolean} [fromUserStatus]
 * @return {string} Multiline SQL-Statements
 * @author Kai Koch
 * @link https://dev.twitter.com/docs/platform-objects/tweets
 */
function tweet(t, sqlEscFunc, fromUserStatus) {
    'use strict';
    /**
     * To prevent a cyclic behaviour, when the Tweet object is instanciated by
     * an user object
     * @default defaults to false
     * @type {boolean}
     */
    fromUserStatus = fromUserStatus || false;
    var rows = [],
        /**
         * SQL-escaped JSON string of Tweet's unknown child objects,
         * that were added after to the Twitter-API
         * @default defaults to an empty string
         * @type {string}
         */
        unknown = '',
        /**
        * Holds the data of the Tweet
        * @type {object}
        */
        dat = {
            /**
             * Unused. Future/beta home for status annotations. If it occures it
             * will be stringified JSON
             * @default defaults to SQL-string null
             * @type {string}
             */
            annotations: 'null',
            /**
             * Nullable. Collection of Contributors as SQL-string
             * @default defaults to null
             * @type {string}
             */
            contributors: '',
            /**
             * Nullable. Collection of Coordinates as SQL-string
             * @default defaults to null
             * @type {Coordinates}
             */
            coordinates: '',
            /**
             * UTC time when this Tweet was created.<br>
             * Transformed into MySQL-date format
             * @default defaults to empty string
             * @type {string}
             */
            created_at: '',
            /**
             * Perspectival. Only surfaces on methods supporting the
             * include_my_retweet parameter, when set to true. Details the Tweet
             * ID of the user's own retweet (if existent) of this Tweet.<br>
             * Example: {"id": 26815871309,"id_str": "26815871309"} uses only
             * id_str
             * @default defaults to SQL-string null
             * @type {string}
             */
            current_user_retweet: 'null',
            /**
             * Entities which have been parsed out of the text of the Tweet.<br>
             * Example:  {
             *     "hashtags":[],
             *     "media":[],
             *     "symbols": [],
             *     "urls":[],
             *     "user_mentions":[]
             * }
             * @default defaults to null
             * @type {string}
             */
            entities: '',
            /**
             * Nullable. Indicates approximately how many times this Tweet has
             * been "favorited" by Twitter users.
             * Example: 1585
             * @default defaults to null
             * @type {number}
             */
            favorite_count: null,
            /**
             * Nullable. Perspectival. Indicates whether this Tweet has been
             * favorited by the authenticating user.
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            favorited: 'null',
            /**
             * Indicates the maximum value of the filter_level parameter which
             * may be used and still stream this Tweet. So a value of medium
             * will be streamed on none, low, and medium streams.
             * @see dev.twitter.com/blog/introducing-new-metadata-for-tweets
             * @default defaults to SQL-string null
             * @type {string} String 'null' OR 'none', 'low', 'medium', 'high'
             */
            filter_level: 'null',
            /**
             * Deprecated. Nullable. Use the "coordinates" field instead.
             * @type {object}
             */
            geo: 'null',
            /**
             * Nullable. If the represented Tweet is a reply, this field will
             * contain the screen name of the original Tweet's author.<br>
             * Example: "twitterapi"
             * @default defaults to SQL-string null
             * @type {string}
             */
            in_reply_to_screen_name: 'null',
            /**
             * Nullable. If the represented Tweet is a reply, this field will
             * contain the string representation of the original Tweet's ID.
             * Example: "114749583439036416"
             * @default defaults to SQL-string null
             * @type {string}
             */
            in_reply_to_status_id_str: 'null',
            /**
             * Nullable. If the represented Tweet is a reply, this field will
             * contain the string representation of the original Tweet's author
             * ID.
             * <br>Example:"819797"
             * @default defaults to SQL-string null
             * @type {string}
             */
            in_reply_to_user_id_str: 'null',
            /**
             * Nullable. When present, indicates a BCP 47 language identifier
             * corresponding to the machine-detected language of the Tweet text,
             * or "und" if no language could be detected.
             * @see http://tools.ietf.org/html/bcp47
             * @default defaults to SQL-string null
             * @type {string}
             */
            lang: 'null',
            /**
             * Nullable. When present, indicates that the tweet is associated
             * (but not necessarily originating from) a Place.
             * @default defaults to null
             * @type {Place}
             */
            place: null,
            /**
             * Place_id as string
             * @type {string}
             */
            placeId: 'null',
            /**
             * Nullable. This field only surfaces when a tweet contains a link.
             * The meaning of the field doesn't pertain to the tweet content
             * itself, but instead it is an indicator that the URL contained in
             * the tweet may contain content or media identified as sensitive
             * content.
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            possibly_sensitive: 'null',
            /**
             * !!!Undocumented Twitter field!!!
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            possibly_sensitive_editable: 'null',
            /**
             * A set of key-value pairs indicating the intended contextual
             * delivery of the containing Tweet. Currently used by Twitter's
             * Promoted Products. Stored as SQL-escaped JSON string<br>
             * Example: {"followers":false}
             * @default defaults to SQL-string null
             * @type {string}
             */
            scopes: 'null',
            /**
             * Number of times this Tweet has been retweeted. This field is no
             * longer capped at 99 and will not turn into a String for
             * "100+"<br>
             * Example: 1585
             * @default defaults to SQL-string null
             * @type {number}
             */
            retweet_count: 0,
            /**
             * Perspectival. Indicates whether this Tweet has been retweeted by
             * the authenticating user.
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            retweeted: 'null',
            /**
             * If the tweet is a retweet, it will include a node called
             * retweeted_status that within contains the tweet that has been
             * retweeted. The outer-most elements of the structure represent
             * the "new tweet" created to house the retweet.<br>
             * see: https://dev.twitter.com/discussions/2994
             * @default defaults to empty String
             * @type {string}
             * @link https://dev.twitter.com/discussions/2994
             */
            retweeted_status: '',
            /**
             * Utility used to post the Tweet, as an HTML-formatted string.
             * Tweets from the Twitter website have a source value of web.<br>
             * Example:<br>
             * '\u003Ca href="http://itunes.apple.com/us/app/twitter/id409789998
             * ?mt=12" rel="nofollow"\u003ETwitter for Mac\u003C\/a\u003E'
             * @default defaults to SQL-string null
             * @type {string}
             */
            source: 'null',
            /**
             * The actual UTF-8 text of the status update. See twitter-text for
             * details on what is currently considered valid characters.<br>
             * Example: "Tweet Button, Follow Button, and Web Intents javascript
             * now support SSL http:\/\/t.co\/9fbA0oYy ^TS"
             * @default defaults to empty string
             * @type {string}
             */
            text: '',
            /**
             * Indicates whether the value of the text parameter was truncated,
             * for example, as a result of a retweet exceeding the 140 character
             * Tweet length. Truncated text will end in ellipsis, like this ...
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            truncated: 'null',
            /**
             * Users can be anyone or anything. They tweet, follow, create
             * lists, have a home_timeline, can be mentioned, and can be looked
             * up in bulk.
             * @default defaults to null
             * @type {string}
             */
            user: '',
            /**
             * User ID
             * @default defaults to empty string
             * @type {string}
             */
            userId: '',
            /**
             * When present and set to "true", it indicates that this piece of
             * content has been withheld due to a DMCA complaint.
             * @default defaults to SQL-string null
             * @type {string} String 'null', 'true' or 'false'
             */
            withheld_copyright: 'null',
            /**
             * When present, indicates a textual representation of the
             * two-letter country codes this content is withheld from. See New
             * Withheld Content Fields in API Responses.<br>
             * Example:  "GR, HK, MY"
             * @default defaults to SQL-string null
             * @type {string}
             */
            withheld_in_countries: 'null',
            /**
             * When present, indicates whether the content being withheld is the
             * "status" or a "user."<br>
             * Example: "status"
             * @default defaults to SQL-string null
             * @type {string}
             */
            withheld_scope: 'null'
        };
    // remove all int64 entries, we can not handle them in JS!
    delete t.id;
    delete t.in_reply_to_status_id;
    delete t.in_reply_to_user_id;
    /**
     * The string representation of the unique identifier for this Tweet.
     * Implementations should use this rather than the large integer in id.
     * Example: "114749583439036416"
     * @type {string}
     */
    dat.id_str = sqlEscFunc(t.id_str);
    delete t.id_str;
    if (t.annotations) {
        dat.annotations = sqlEscFunc(JSON.stringify(t.annotations));
    }
    delete t.annotations;
    if (t.contributors !== null) {
        dat.contributors = contributors(t.contributors, dat.id_str, sqlEscFunc);
    }
    delete t.contributors;
    if (t.coordinates !== null) {
        dat.coordinates = coordinates(t.coordinates, dat.id_str, sqlEscFunc);
    }
    delete t.coordinates;
    dat.created_at = sqlEscFunc(new Date(t.created_at));
    delete t.created_at;
    if (t.current_user_retweet) {
        dat.current_user_retweet = sqlEscFunc(t.current_user_retweet.id_str);
    }
    delete t.current_user_retweet;
    if (t.entities !== null) {
        dat.entities = entities(t.entities, dat.id_str, sqlEscFunc);
    }
    delete t.entities;
    if (t.favorite_count || t.favorite_count === 0) {
        dat.favorite_count = sqlEscFunc(t.favorite_count);
    }
    delete t.favorite_count;
    if (t.favorited === false) {
        dat.favorited = "'false'";
    } else if (t.favorited === true) {
        dat.favorited = "'true'";
    }
    delete t.favorited;
    if (t.filter_level) {
        dat.filter_level = sqlEscFunc(t.filter_level);
    }
    delete t.filter_level;
    if (t.geo !== null) {
        dat.geo = sqlEscFunc(JSON.stringify(t.geo));
    }
    delete t.geo;
    if (t.in_reply_to_screen_name) {
        dat.in_reply_to_screen_name = sqlEscFunc(t.in_reply_to_screen_name);
    }
    delete t.in_reply_to_screen_name;
    if (t.in_reply_to_status_id_str) {
        dat.in_reply_to_status_id_str = sqlEscFunc(t.in_reply_to_status_id_str);
    }
    delete t.in_reply_to_status_id_str;
    if (t.in_reply_to_user_id_str) {
        dat.in_reply_to_user_id_str = sqlEscFunc(t.in_reply_to_user_id_str);
    }
    delete t.in_reply_to_user_id_str;
    if (t.lang) {
        dat.lang = sqlEscFunc(t.lang);
    }
    delete t.lang;
    if (t.place !== null) {
        dat.place = place(t.place, sqlEscFunc);
        dat.placeId = sqlEscFunc(t.place.id);
    }
    delete t.place;
    if (t.possibly_sensitive === false) {
        dat.possibly_sensitive = "'false'";
    } else if (t.possibly_sensitive === true) {
        dat.possibly_sensitive = "'true'";
    }
    delete t.possibly_sensitive;
    if (t.possibly_sensitive_editable === false) {
        dat.possibly_sensitive_editable = "'false'";
    } else if (t.possibly_sensitive_editable === true) {
        dat.possibly_sensitive_editable = "'true'";
    }
    delete t.possibly_sensitive_editable;
    if (t.scopes) {
        dat.scopes = sqlEscFunc(JSON.stringify(t.scopes));
    }
    delete t.scopes;
    if (typeof t.retweet_count === 'number') {
        dat.retweet_count = t.retweet_count;
    }
    delete t.retweet_count;
    if (t.retweeted === false) {
        dat.retweeted = "'false'";
    } else if (t.retweeted === true) {
        dat.retweeted = "'true'";
    }
    delete t.retweeted;
    if (t.retweeted_status) {
        dat.retweeted_status = tweet(t.retweeted_status, sqlEscFunc, false);
    }
    delete t.retweeted_status;
    if (t.source) {
        dat.source = sqlEscFunc(t.source);
    }
    delete t.source;
    if (t.text) {
        dat.text = sqlEscFunc(t.text);
    }
    delete t.text;
    if (t.truncated === false) {
        dat.truncated = "'false'";
    } else if (t.truncated === true) {
        dat.truncated = "'true'";
    }
    delete t.truncated;
    // if this tweet originates from user.status, do not
    // instanciate a new User object
    dat.userId = sqlEscFunc(t.user.id_str);
    if (!fromUserStatus) {
        dat.user = user(t.user, sqlEscFunc);
    }
    delete t.user;
    if (t.withheld_copyright === false) {
        dat.withheld_copyright = "'false'";
    } else if (t.withheld_copyright === true) {
        dat.withheld_copyright = "'true'";
    }
    delete t.withheld_copyright;
    if (t.withheld_in_countries) {
        dat.withheld_in_countries = sqlEscFunc(t.withheld_in_countries);
    }
    delete t.withheld_in_countries;
    if (t.withheld_scope) {
        dat.withheld_scope = sqlEscFunc(t.withheld_scope);
    }
    delete t.withheld_scope;
    unknown = JSON.stringify(t);
    if (unknown === '{}') {
        unknown = '';
    } else {
        unknown = sqlEscFunc(unknown);
    }
    // Insert original tweet it it was retweeted and a Node in the current tweet
    if (dat.retweeted_status) {
        rows.push(dat.retweeted_status);
    }
    // Insert the User, we might get another Tweet from the
    // User object, that contains less information and would overwrite the tweet
    // containing more information
    if (dat.user) {
        rows.push(dat.user);
    }
    rows.push(format(insTweets,
        dat.id_str,
        dat.annotations,
        dat.created_at,
        dat.current_user_retweet,
        dat.favorite_count,
        dat.favorited,
        dat.filter_level,
        dat.geo,
        dat.in_reply_to_screen_name,
        dat.in_reply_to_status_id_str,
        dat.in_reply_to_user_id_str,
        dat.lang,
        dat.placeId,
        dat.possibly_sensitive,
        dat.possibly_sensitive_editable,
        dat.scopes,
        dat.retweet_count,
        dat.retweeted,
        dat.source,
        dat.text,
        dat.truncated,
        dat.userId,
        dat.withheld_copyright,
        dat.withheld_in_countries,
        dat.withheld_scope));
    if (dat.contributors) {
        rows.push(dat.contributors);
    }
    if (dat.coordinates) {
        rows.push(dat.coordinates);
    }
    if (dat.entities) {
        rows.push(dat.entities);
    }
    if (dat.place) {
        rows.push(dat.place);
    }
    if (unknown) {
        rows.push(format(insUnknownTweetObjs,
            dat.id_str,
            dat.created_at,
            unknown));
    }
    return rows.join('\n');
}
module.exports = tweet;