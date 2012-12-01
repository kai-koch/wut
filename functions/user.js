/*properties
    contributors_enabled, created_at, default_profile, default_profile_image,
    description, exports, favourites_count, follow_request_sent,
    followers_count, following, format, friends_count, geo_enabled, id, id_str,
    is_translator, join, lang, listed_count, location, name, notifications,
    profile_background_color, profile_background_image_url,
    profile_background_image_url_https, profile_background_tile,
    profile_banner_url, profile_image_url, profile_image_url_https,
    profile_link_color, profile_sidebar_border_color,
    profile_sidebar_fill_color, profile_text_color,
    profile_use_background_image, protected, prtctd, push, screen_name,
    show_all_inline_media, status, statusId, statusSql, statuses_count,
    stringify, time_zone, url, user, utc_offset, verified,
    withheld_in_countries, withheld_scope
*/
var format = require('util').format,
    /**
     * Data-Class for storing Tweet objects
     * see: dev.twitter.com/docs/platform-objects/tweets
     * @function
     * @param {object} t the object representing the tweet
     * @param {function} sqlEscFunc Reference to the function used to escape
     *     values for SQL-statements, usually the connection.escape() function
     * @param {boolean} [fromUserStatus] Does t originate from a user object?
     * @author Kai Koch
     * @link https://dev.twitter.com/docs/platform-objects/tweets
     * @return {string}
     */
    tweet = require('./tweet'),
    /**
     * Static string template for the INSERT-statement
     * @type {string}
     */
    insUser = 'INSERT INTO wut_users (id, contributors_enabled,' +
        ' created_at, default_profile, default_profile_image,' +
        ' description, favourites_count, follow_request_sent,' +
        ' following, followers_count, friends_count, geo_enabled,' +
        ' is_translator, lang, listed_count, location, name,' +
        ' notifications, profile_background_color,' +
        ' profile_background_image_url,' +
        ' profile_background_image_url_https, profile_background_tile,' +
        ' profile_banner_url, profile_image_url, profile_image_url_https,' +
        ' profile_link_color, profile_sidebar_border_color,' +
        ' profile_sidebar_fill_color, profile_text_color,' +
        ' profile_use_background_image, protected, screen_name,' +
        ' show_all_inline_media, status, statuses_count, time_zone, url,' +
        ' utc_offset, verified, withheld_in_countries, withheld_scope)' +
        ' VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,' +
        ' %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,' +
        ' %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE' +
        ' contributors_enabled=VALUES(contributors_enabled), created_at' +
        '=VALUES(created_at), default_profile=VALUES(default_profile),' +
        ' default_profile_image=VALUES(default_profile_image), description' +
        '=VALUES(description), favourites_count=VALUES(favourites_count),' +
        ' follow_request_sent=VALUES(follow_request_sent), following' +
        '=VALUES(following), followers_count=VALUES(followers_count),' +
        ' friends_count=VALUES(friends_count), geo_enabled' +
        '=VALUES(geo_enabled), is_translator=VALUES(is_translator), lang' +
        '=VALUES(lang), listed_count=VALUES(listed_count), location' +
        '=VALUES(location), name=VALUES(name), notifications' +
        '=VALUES(notifications), profile_background_color' +
        '=VALUES(profile_background_color), profile_background_image_url' +
        '=VALUES(profile_background_image_url),' +
        ' profile_background_image_url_https' +
        '=VALUES(profile_background_image_url_https), profile_background_tile' +
        '=VALUES(profile_background_tile), profile_banner_url' +
        '=VALUES(profile_banner_url), profile_image_url' +
        '=VALUES(profile_image_url), profile_image_url_https' +
        '=VALUES(profile_image_url_https), profile_link_color' +
        '=VALUES(profile_link_color), profile_sidebar_border_color' +
        '=VALUES(profile_sidebar_border_color), profile_sidebar_fill_color' +
        '=VALUES(profile_sidebar_fill_color), profile_text_color' +
        '=VALUES(profile_text_color), profile_use_background_image' +
        '=VALUES(profile_use_background_image), protected=VALUES(protected),' +
        ' screen_name=VALUES(screen_name), show_all_inline_media' +
        '=VALUES(show_all_inline_media), status=VALUES(status),' +
        ' statuses_count=VALUES(statuses_count), time_zone=VALUES(time_zone),' +
        ' url=VALUES(url), utc_offset=VALUES(utc_offset), verified' +
        '=VALUES(verified), withheld_in_countries' +
        '=VALUES(withheld_in_countries), withheld_scope' +
        '=VALUES(withheld_scope);',
    /**
     * Static string template of the INSERT-statement
     * @type {string}
     */
    insUnknownUserObjs = 'INSERT INTO wut_unknown_user_objs (user_id, ' +
        'timestamp, unknown) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE' +
        ' timestamp=VALUES(timestamp), unknown=VALUES(unknown);';

/**
 * Returns the INSERTS-statements for the user object and its child objects.<br>
 * The User object in a tweet or from the search endpoint. Users can be anyone
 * or anything. They tweet, follow, create lists, have a home_timeline, can be
 * mentioned, and can be looked up in bulk.
 * @param {object} usr
 * @param {function} sqlEscFunc
 * @return {string}
 * @author Kai Koch
 */
function user(usr, sqlEscFunc) {
    'use strict';
        /**
         * An string to store information, that gets added by twitter after this
         * application is written
         * @default defaults to an empty object string
         * @type {string}
         */
    var unknown = '{}',
        /**
         * Accumulator for the SQL-Statements
         * @type {array}
         */
        rows = [],
        /**
        * Data-object to hold the user data
        * @type {object}
        */
        userDat = {
            /**
            * Indicates that the user has an account with "contributor mode"
            * enabled, allowing for Tweets issued by the user to be co-authored
            * by another account. Rarely true.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            contributors_enabled: 'null',
            /**
            * The UTC datetime that the user account was created on Twitter.
            * Example: "Mon Nov 29 21:18:15 +0000 2010"
            * @default defaults to an empty string
            * @type {string}
            */
            created_at: '',
            /**
            * When true, indicates that the user has not altered the theme or
            * background of their user profile.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            default_profile: 'null',
            /**
            * When true, indicates that the user has not uploaded their own
            * avatar and a default egg avatar is used instead.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            default_profile_image: 'null',
            /**
            * Nullable. The user-defined UTF-8 string describing their account.
            * Example: "The Real Twitter API."
            * @default defaults to SQL-string null
            * @type {string}
            */
            description: 'null',
            /**
            * The number of tweets this user has favorited in the account's
            * lifetime. British spelling used in the field name for historical
            * reasons.
            * @default defaults to SQL-string null
            * @type {number}
            */
            favourites_count: 0,
            /**
            * Nullable. Perspectival. When true, indicates that the
            * authenticating user has issued a follow request to this protected
            * user account.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            follow_request_sent: 'null',
            /**
            * Nullable. Perspectival. Deprecated. When true, indicates that the
            * authenticating user is following this user. Some false negatives
            * are possible when set to "false," but these false negatives are
            * increasingly being represented as "null" instead.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            following: 'null',
            /**
            * The number of followers this account currently has. Under certain
            * conditions of duress, this field will temporarily indicate "0."
            * @default defaults to SQL-string null
            * @type {number}
            */
            followers_count: 0,
            /**
            * The number of users this account is following (AKA their
            * "followings"). Under certain conditions of duress, this field will
            * temporarily indicate "0."
            * @default defaults to SQL-string null
            * @type {number}
            */
            friends_count: 0,
            /**
            * When true, indicates that the user has enabled the possibility of
            * geotagging their Tweets. This field must be true for the current
            * user to attach geographic data when using POST statuses/update.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            geo_enabled: 'null',
            /**
            * The string representation of the unique identifier for this user.
            * Example: "6253282"
            * @default defaults to SQL-string null
            * @type {string}
            */
            id_str: '',
            /**
            * When true, indicates that the user is a participant in Twitter's
            * translator community.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            is_translator: 'null',
            /**
            * The ISO 639-1 two-letter character code for the user's
            * self-declared user interface language. May or may not have
            * anything to do with the content of their Tweets.<br>
            * Example: "en"
            * @default defaults to SQL-string null
            * @type {string}
            */
            lang: 'null',
            /**
            * The number of public lists that this user is a member of.
            * @default defaults to SQL-string null
            * @type {number}
            */
            listed_count: 0,
            /**
            * Nullable. The user-defined location for this account's profile.
            * Not necessarily a location nor parseable. This field will
            * occasionally be fuzzily interpreted by the Search service.
            * Example: "San Francisco, CA"
            * @default defaults to SQL-string null
            * @type {string}
            */
            location: 'null',
            /**
            * The name of the user, as they've defined it. Not necessarily a
            * person's name. Typically capped at 20 characters, but subject to
            * change.
            * Example: "Twitter API"
            * @default defaults to empty string
            * @type {string}
            */
            name: '',
            /**
            * Nullable. Deprecated. May incorrectly report "false" at times.
            * Indicates whether the authenticated user has chosen to receive
            * this user's tweets by SMS.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            notifications: 'null',
            /**
            * The hexadecimal color chosen by the user for their background.
            * Example: "e8f2f7"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_background_color: 'null',
            /**
            * A HTTP-based URL pointing to the background image the user has
            * uploaded for their profile.<br>
            * Example:
            * "http://a2.twimg.com/profile_background_images/229/twitterapi-bg
            * .png"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_background_image_url: 'null',
            /**
            * A HTTPS-based URL pointing to the background image the user has
            * uploaded for their profile.<br>
            * Example:
            * "https://si0.twimg.com/profile_background_images/2/twitterapi-bg
            * .png"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_background_image_url_https: 'null',
            /**
            * When true, indicates that the user's profile_background_image_url
            * should be tiled when displayed.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            profile_background_tile: 'null',
            /**
            * Undocumented field in Twitter API
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_banner_url: 'null',
            /**
            * A HTTP-based URL pointing to the user's avatar image.<br>
            * Example:
            * "http://a2.twimg.com/profile_images/14386340/avatar_normal.png"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_image_url: 'null',
            /**
            * A HTTPS-based URL pointing to the user's avatar image.<br>
            * Example:
            * "https://si0.twimg.com/profile_images/1438634/avatar_normal.png"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_image_url_https: 'null',
            /**
            * The hexadecimal color the user has chosen to display links with in
            * their Twitter UI.<br>
            * Example: "0094C2"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_link_color: 'null',
            /**
            * The hexadecimal color the user has chosen to display sidebar
            * borders with in their Twitter UI. Example: "0094C2"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_sidebar_border_color: 'null',
            /**
            * The hexadecimal color the user has chosen to display sidebar
            * backgrounds with in their Twitter UI. Example: "a9d9f1"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_sidebar_fill_color: 'null',
            /**
            * The hexadecimal color the user has chosen to display text with in
            * their Twitter UI.<br>
            * Example: "437792"
            * @default defaults to SQL-string null
            * @type {string}
            */
            profile_text_color: 'null',
            /**
            * When true, indicates the user wants their uploaded background
            * image to be used.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            profile_use_background_image: 'null',
            /**
            * When true, indicates that this user has chosen to protect their
            * Tweets.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            prtctd: 'null',
            /**
            * The screen name, handle, or alias that this user identifies
            * themselves with. screen_names are unique but subject to change.
            * Use id_str as a user identifier whenever possible. Typically a
            * maximum of 15 characters long, but some historical accounts may
            * exist with longer names.<br>
            * Example: "twitterapi"
            * @default defaults to SQL-string null
            * @type {string}
            */
            screen_name: '',
            /**
            * Indicates that the user would like to see media inline.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            show_all_inline_media: 'null',
            /**
            * Nullable. If possible, the user's most recent tweet or retweet. In
            * some circumstances, this data cannot be provided and this field
            * will be omitted, null, or empty. Perspectival attributes within
            * tweets embedded within users cannot always be relied upon.
            * @default defaults to null
            * @type {string} SQL-String for this tweet
            */
            statusSql: '',
            /**
            * If exists id of last tweet
            * @default defaults to SQL-string null
            * @type {string}
            */
            statusId: 'null',
            /**
            * The number of tweets (including retweets) issued by the user.
            * @default defaults to SQL-string null
            * @type {number}
            */
            statuses_count: 0,
            /**
            * Nullable. A string describing the Time Zone this user declares
            * themselves within.<br>
            * Example: "Pacific Time (US & Canada)"
            * @default defaults to SQL-string null
            * @type {string}
            */
            time_zone: 'null',
            /**
            * Nullable. A URL provided by the user in association with their
            * profile.<br>
            * Example: "http://dev.twitter.com"
            * @type {string}
            */
            url: 'null',
            /**
            * Nullable. The offset from GMT/UTC in seconds. Example: -18000
            * @default defaults to SQL-string null
            * @type {number}
            */
            utc_offset: 0,
            /**
            * When true, indicates that the user has a verified account.
            * @default defaults to SQL-string null
            * @type {string} String 'null', 'true' or 'false'
            */
            verified: 'null',
            /**
            * When present, indicates a textual representation of the two-letter
            * country codes this user is withheld from. See New Withheld Content
            * Fields in API Responses. Example: "GR, HK, MY"
            * @default defaults to SQL-string null
            * @type {string}
            */
            withheld_in_countries: 'null',
            /**
            * When present, indicates whether the content being withheld is the
            * "status" or a "user"
            * Example: "user"
            * @default defaults to SQL-string null
            * @type {string}
            */
            withheld_scope: 'null'
        };
    // We can not handle int64 values
    delete usr.id;
    userDat.id_str = sqlEscFunc(usr.id_str);
    if (usr.contributors_enabled === false) {
        userDat.contributors_enabled = "'false'";
    } else if (usr.contributors_enabled === true) {
        userDat.contributors_enabled = "'true'";
    }
    delete usr.contributors_enabled;
    userDat.created_at = sqlEscFunc(new Date(usr.created_at));
    delete usr.created_at;
    if (usr.default_profile === false) {
        userDat.default_profile = "'false'";
    } else if (usr.contributors_enabled === true) {
        userDat.default_profile = "'true'";
    }
    delete usr.default_profile;
    if (usr.default_profile_image === false) {
        userDat.default_profile_image = "'false'";
    } else if (usr.default_profile_image === true) {
        userDat.default_profile_image = "'true'";
    }
    delete usr.default_profile_image;
    if (usr.description) {
        userDat.description = sqlEscFunc(usr.description);
    }
    delete usr.description;
    if (typeof usr.favourites_count === 'number') {
        userDat.favourites_count = usr.favourites_count;
    }
    delete usr.favourites_count;
    if (usr.follow_request_sent === false) {
        userDat.follow_request_sent = "'false'";
    } else if (usr.follow_request_sent === true) {
        userDat.follow_request_sent = "'true'";
    }
    delete usr.follow_request_sent;
    if (usr.following === false) {
        userDat.following = "'false'";
    } else if (usr.following === true) {
        userDat.following = "'true'";
    }
    delete usr.following;
    if (typeof usr.followers_count === 'number') {
        userDat.followers_count = usr.followers_count;
    }
    delete usr.followers_count;
    if (typeof usr.friends_count === 'number') {
        userDat.friends_count = usr.friends_count;
    }
    delete usr.friends_count;
    if (usr.geo_enabled === false) {
        userDat.geo_enabled = "'false'";
    } else if (usr.following === true) {
        userDat.geo_enabled = "'true'";
    }
    delete usr.geo_enabled;
    if (usr.is_translator === false) {
        userDat.is_translator = "'false'";
    } else if (usr.is_translator === true) {
        userDat.is_translator = "'true'";
    }
    delete usr.is_translator;
    if (usr.lang) {
        userDat.lang = sqlEscFunc(usr.lang);
    }
    delete usr.lang;
    if (typeof usr.listed_count === 'number') {
        userDat.listed_count = usr.listed_count;
    }
    delete usr.listed_count;
    if (usr.location) {
        userDat.location = sqlEscFunc(usr.location);
    }
    delete usr.location;
    userDat.name = sqlEscFunc(usr.name);
    delete usr.name;
    if (usr.notifications === false) {
        userDat.notifications = "'false'";
    } else if (usr.notifications === true) {
        userDat.notifications = "'true'";
    }
    delete usr.notifications;
    if (usr.profile_background_color) {
        userDat.profile_background_color =
            sqlEscFunc(usr.profile_background_color);
    }
    delete usr.profile_background_color;
    if (usr.profile_background_image_url) {
        userDat.profile_background_image_url =
            sqlEscFunc(usr.profile_background_image_url);
    }
    delete usr.profile_background_image_url;
    if (usr.profile_background_image_url_https) {
        userDat.profile_background_image_url_https =
            sqlEscFunc(usr.profile_background_image_url_https);
    }
    delete usr.profile_background_image_url_https;
    if (usr.profile_background_tile === false) {
        userDat.profile_background_tile = "'false'";
    } else if (usr.profile_background_tile === true) {
        userDat.profile_background_tile = "'true'";
    }
    delete usr.profile_background_tile;
    if (usr.profile_banner_url) {
        userDat.profile_banner_url = sqlEscFunc(usr.profile_banner_url);
    }
    delete usr.profile_banner_url;
    if (usr.profile_image_url) {
        userDat.profile_image_url = sqlEscFunc(usr.profile_image_url);
    }
    delete usr.profile_image_url;
    if (usr.profile_image_url_https) {
        userDat.profile_image_url_https =
            sqlEscFunc(usr.profile_image_url_https);
    }
    delete usr.profile_image_url_https;
    if (usr.profile_link_color) {
        userDat.profile_link_color = sqlEscFunc(usr.profile_link_color);
    }
    delete usr.profile_link_color;
    if (usr.profile_sidebar_border_color) {
        userDat.profile_sidebar_border_color =
            sqlEscFunc(usr.profile_sidebar_border_color);
    }
    delete usr.profile_sidebar_border_color;
    if (usr.profile_sidebar_fill_color) {
        userDat.profile_sidebar_fill_color =
            sqlEscFunc(usr.profile_sidebar_fill_color);
    }
    delete usr.profile_sidebar_fill_color;
    if (usr.profile_text_color) {
        userDat.profile_text_color = sqlEscFunc(usr.profile_text_color);
    }
    delete usr.profile_text_color;
    if (usr.profile_use_background_image === false) {
        userDat.profile_use_background_image = "'false'";
    } else if (usr.profile_use_background_image === true) {
        userDat.profile_use_background_image = "'true'";
    }
    delete usr.profile_use_background_image;
    if (usr["protected"] === false) {
        userDat.prtctd = "'false'";
    } else if (usr["protected"] === true) {
        userDat.prtctd = "'true'";
    }
    delete usr["protected"];
    userDat.screen_name = sqlEscFunc(usr.screen_name);
    delete usr.screen_name;
    if (usr.show_all_inline_media === false) {
        userDat.show_all_inline_media = "'false'";
    } else if (usr.profile_use_background_image === true) {
        userDat.show_all_inline_media = "'true'";
    }
    delete usr.show_all_inline_media;
    if (usr.status) {
        // add user.id_str so we can reuse the Tweet function
//        usr.status.user = {};
        usr.status.user.id_str = usr.id_str;
        userDat.statusSql = tweet(usr.status, sqlEscFunc, true);
        userDat.statusId = usr.status.id_str;
    }
    delete usr.id_str;
    delete usr.status;
    if (typeof usr.statuses_count === 'number') {
        userDat.statuses_count = usr.statuses_count;
    }
    delete usr.statuses_count;
    if (usr.time_zone) {
        userDat.time_zone = sqlEscFunc(usr.time_zone);
    }
    delete usr.time_zone;
    if (usr.url) {
        userDat.url = sqlEscFunc(usr.url);
    }
    delete usr.url;
    if (typeof usr.utc_offset === 'number') {
        userDat.utc_offset = usr.utc_offset;
    }
    delete usr.utc_offset;
    if (usr.verified === false) {
        userDat.verified = "'false'";
    } else if (usr.verified === true) {
        userDat.verified = "'true'";
    }
    delete usr.verified;
    if (usr.withheld_in_countries) {
        userDat.withheld_in_countries = sqlEscFunc(usr.withheld_in_countries);
    }
    delete usr.withheld_in_countries;
    if (usr.withheld_scope) {
        userDat.withheld_scope = sqlEscFunc(usr.withheld_scope);
    }
    delete usr.withheld_scope;
    unknown = JSON.stringify(usr);
    if (unknown !== '{}') {
        unknown = sqlEscFunc(unknown);
    } else {
        unknown = '';
    }
    rows.push(format(insUser,
        userDat.id_str,
        userDat.contributors_enabled,
        userDat.created_at,
        userDat.default_profile,
        userDat.default_profile_image,
        userDat.description,
        userDat.favourites_count,
        userDat.follow_request_sent,
        userDat.following,
        userDat.followers_count,
        userDat.friends_count,
        userDat.geo_enabled,
        userDat.is_translator,
        userDat.lang,
        userDat.listed_count,
        userDat.location,
        userDat.name,
        userDat.notifications,
        userDat.profile_background_color,
        userDat.profile_background_image_url,
        userDat.profile_background_image_url_https,
        userDat.profile_background_tile,
        userDat.profile_banner_url,
        userDat.profile_image_url,
        userDat.profile_image_url_https,
        userDat.profile_link_color,
        userDat.profile_sidebar_border_color,
        userDat.profile_sidebar_fill_color,
        userDat.profile_text_color,
        userDat.profile_use_background_image,
        userDat.prtctd,
        userDat.screen_name,
        userDat.show_all_inline_media,
        userDat.statusId,
        userDat.statuses_count,
        userDat.time_zone,
        userDat.url,
        userDat.utc_offset,
        userDat.verified,
        userDat.withheld_in_countries,
        userDat.withheld_scope));
    // if exists, add the last Tweet of this user to the SQL-Staments
    if (userDat.statusSql) {
        rows.push(userDat.statusSql);
    }
    if (unknown) {
        rows.push(format(insUnknownUserObjs,
            userDat.id_str,
            userDat.created_at,
            unknown));
    }
    return rows.join('\n');
}
module.exports = user;