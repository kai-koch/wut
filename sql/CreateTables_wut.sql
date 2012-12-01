-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 01, 2012 at 06:05 AM
-- Server version: 5.5.16
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `wut`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_contributors`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_contributors` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'The integer representation of the unique identifier for a Tweet.',
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'The integer representation of the ID of the user who contributed to this Tweet.',
  `screen_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The screen name of the user who contributed to this Tweet.',
  PRIMARY KEY (`tweet_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `screen_name` (`screen_name`(15))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='An collection of brief user objects (usually only one) indicating users who cont';

--
-- RELATIONS FOR TABLE `wut_contributors`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_delete`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_delete` (
  `id` bigint(20) unsigned NOT NULL COMMENT 'id of tweet to be deleted',
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'user_id',
  `executed` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'Has this deletion been executed?',
  PRIMARY KEY (`id`),
  KEY `executed` (`executed`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Status deletion notices (delete)';

--
-- RELATIONS FOR TABLE `wut_delete`:
--   `id`
--       `wut_tweets` -> `id`
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_follow`
--
-- Creation: Nov 07, 2012 at 01:24 AM
--

CREATE TABLE IF NOT EXISTS `wut_follow` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Track ID',
  `follow` bigint(20) unsigned NOT NULL COMMENT '5000 users can be active at the same time',
  `begin` datetime NOT NULL COMMENT 'Datetime when to start the search for the track',
  `end` datetime NOT NULL COMMENT 'Datetime when to end the search for the track',
  `authorized_by` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'Webuser, who entered the search',
  PRIMARY KEY (`ID`),
  KEY `track` (`follow`,`begin`,`end`,`authorized_by`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table that stores twitter users to be searched.' AUTO_INCREMENT=5 ;

--
-- RELATIONS FOR TABLE `wut_follow`:
--   `follow`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_geo_objects`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_geo_objects` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'Id of tweet',
  `type` enum('Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon','GeometryCollection') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Point' COMMENT 'Type of geo object',
  PRIMARY KEY (`tweet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Represents the geographic location of a Tweet as reported';

--
-- RELATIONS FOR TABLE `wut_geo_objects`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--

--
-- Triggers `wut_geo_objects`
--
DROP TRIGGER IF EXISTS `geo_objects_del`;
DELIMITER //
CREATE TRIGGER `geo_objects_del` AFTER DELETE ON `wut_geo_objects`
 FOR EACH ROW BEGIN
  DELETE FROM wut_geo_objects_coordinates WHERE tweet_id=OLD.tweet_id;
 END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_geo_objects_coordinates`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_geo_objects_coordinates` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'Id of tweet',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of the coordinates from the tweets coordinates array',
  `longitude` double NOT NULL COMMENT 'As Decimal Degree',
  `latitude` double NOT NULL COMMENT 'As Decimal Degree',
  PRIMARY KEY (`tweet_id`,`index_of`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='coordinates of a tweet object';

--
-- RELATIONS FOR TABLE `wut_geo_objects_coordinates`:
--   `tweet_id`
--       `wut_geo_objects` -> `tweet_id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_hashtags`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_hashtags` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'Id of tweet',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of from the tweets hashtags array',
  `x1` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the # character in the Tweet text string',
  `x2` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the first character after the hashtag. Therefore the difference between the x1 and x2 will be the length of the hashtag name plus one (for the ''#'' character).',
  `text` varchar(139) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the hashtag, minus the leading ''#'' character.',
  PRIMARY KEY (`tweet_id`,`index_of`),
  KEY `text` (`text`(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='hashtags found in a tweet';

--
-- RELATIONS FOR TABLE `wut_hashtags`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_http_statuscodes`
--
-- Creation: Nov 07, 2012 at 06:09 PM
--

CREATE TABLE IF NOT EXISTS `wut_http_statuscodes` (
  `value` smallint(5) unsigned NOT NULL COMMENT 'Numeric Value of the status code',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Short description of the status code',
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RFC reference',
  PRIMARY KEY (`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Source: http://www.iana.org/assignments/http-status-codes/http-status-codes.xml';

-- --------------------------------------------------------

--
-- Table structure for table `wut_limit`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_limit` (
  `time_of_limit_hit` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the Limit occured',
  `track` int(10) unsigned NOT NULL COMMENT 'total count of the number of undelivered Tweets since the connection was opened',
  `processed` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'has this limit been processed',
  PRIMARY KEY (`time_of_limit_hit`),
  KEY `processed` (`processed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Limit notices, get a search on the search-API for that time';

-- --------------------------------------------------------

--
-- Table structure for table `wut_locations`
--
-- Creation: Nov 07, 2012 at 01:49 AM
--

CREATE TABLE IF NOT EXISTS `wut_locations` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Track ID',
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the bounding box',
  `SW` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'longitude,latitude pair / south-west corner of the Boundingbox',
  `NE` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'longitude,latitude pair / north-east corner of the BoundingBox',
  `begin` datetime NOT NULL COMMENT 'Datetime when to start the search for the track',
  `end` datetime NOT NULL COMMENT 'Datetime when to end the search for the track',
  `authorized_by` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'Webuser, who entered the search',
  PRIMARY KEY (`ID`),
  KEY `track` (`SW`,`begin`,`end`,`authorized_by`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table that stores bounding boxes to be searched.' AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_media`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_media` (
  `id` bigint(20) unsigned NOT NULL COMMENT 'ID of the media expressed as a 64-bit integer',
  `display_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL of the media to display to clients',
  `expanded_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'An expanded version of display_url. Links to the media display page',
  `x1` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the first character of the URL in the Tweet text',
  `x2` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the first non-URL character occurring after the URL (or the end of the string if the URL is the last part of the Tweet text)',
  `media_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'An http:// URL pointing directly to the uploaded media file.',
  `media_url_https` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'An https:// URL pointing directly to the uploaded media file, for embedding on https pages.',
  `source_status_id` bigint(20) unsigned DEFAULT NULL COMMENT 'For Tweets containing media that was originally associated with a different tweet, this ID points to the original Tweet.',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of uploaded media.',
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Wrapped URL for the media link. This corresponds with the URL embedded directly into the raw Tweet text, and the values for the indices parameter.',
  PRIMARY KEY (`id`),
  KEY `source_status_id` (`source_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Represents media elements uploaded with the Tweet';

--
-- RELATIONS FOR TABLE `wut_media`:
--   `source_status_id`
--       `wut_tweets` -> `id`
--

--
-- Triggers `wut_media`
--
DROP TRIGGER IF EXISTS `media_del`;
DELIMITER //
CREATE TRIGGER `media_del` AFTER DELETE ON `wut_media`
 FOR EACH ROW BEGIN
  DELETE FROM wut_media_sizes WHERE media_id=OLD.id;
 END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_media_sizes`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_media_sizes` (
  `media_id` bigint(20) unsigned NOT NULL COMMENT 'ID of the media expressed as a 64-bit integer',
  `size` enum('thumb','large','medium','small') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'type of the size',
  `h` smallint(5) unsigned NOT NULL COMMENT 'Height in pixels of this size.',
  `w` smallint(5) unsigned NOT NULL COMMENT 'Width in pixels of this size.',
  `resize` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Resizing method used to obtain this size. A value of fit means that the media was resized to fit one dimension, keeping its native aspect ratio. A value of crop means that the media was cropped in order to fit a specific resolution.',
  PRIMARY KEY (`media_id`,`size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='available sizes for the media file';

--
-- RELATIONS FOR TABLE `wut_media_sizes`:
--   `media_id`
--       `wut_media` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_parser_errors`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_parser_errors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `chunk` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chunks, from the twitter stream that are identified as one msg.',
  `error_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of error',
  `error_message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Text of the error message',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table that store the raw chunks of twitter information' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_places`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_places` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID representing this place. Note that this is represented as a string, not an integer.',
  `attributes` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON object. Contains a hash of variant information about the place. See About Geo Place Attributes.',
  `bounding_box` enum('Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon','GeometryCollection') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'A bounding box of coordinates which encloses this place.',
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Name of the country containing this place.',
  `country_code` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Shortened country code representing the country containing this place.',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Full human-readable representation of the place''s name.',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Short human-readable representation of the place''s name.',
  `place_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The type of location represented by this place.',
  `url` text COLLATE utf8mb4_unicode_ci COMMENT 'URL representing the location of additional place metadata for this place.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Places are specific, named locations with corresponding geo coordinates.';

--
-- Triggers `wut_places`
--
DROP TRIGGER IF EXISTS `places_del`;
DELIMITER //
CREATE TRIGGER `places_del` AFTER DELETE ON `wut_places`
 FOR EACH ROW BEGIN
  DELETE FROM wut_places_bounding_box_coordinates WHERE place_id=OLD.id;
 END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_places_bounding_box_coordinates`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_places_bounding_box_coordinates` (
  `place_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Id of place',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of the coordinates from the places.bounding_box coordinates array',
  `longitude` double NOT NULL COMMENT 'As Decimal Degree',
  `latitude` double NOT NULL COMMENT 'As Decimal Degree',
  PRIMARY KEY (`place_id`,`index_of`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='coordinates of a tweet object';

--
-- RELATIONS FOR TABLE `wut_places_bounding_box_coordinates`:
--   `place_id`
--       `wut_places` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_scrub_geo`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_scrub_geo` (
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'user_id of the parrent user',
  `up_to_status_id` bigint(20) unsigned NOT NULL COMMENT 'latest tweet_id for which geo information must be stripped',
  `executed` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'has this notice been processed?',
  PRIMARY KEY (`user_id`,`up_to_status_id`),
  KEY `executed` (`executed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Location deletion notices';

--
-- RELATIONS FOR TABLE `wut_scrub_geo`:
--   `up_to_status_id`
--       `wut_tweets` -> `id`
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_status_withheld`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_status_withheld` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'indicating the status ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'indicating the user',
  `withheld_in_countries` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'a collection of withheld_in_countries two-letter country codes',
  `processed` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'has this notice been processed',
  PRIMARY KEY (`tweet_id`,`user_id`),
  KEY `processed` (`processed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='These messages indicate that either the indicated tweet or indicated user has ha';

--
-- RELATIONS FOR TABLE `wut_status_withheld`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_stream_statistics`
--
-- Creation: Nov 07, 2012 at 04:13 AM
--

CREATE TABLE IF NOT EXISTS `wut_stream_statistics` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `starttime` datetime NOT NULL,
  `endtime` datetime NOT NULL,
  `affRows` int(10) unsigned NOT NULL,
  `deleteCount` int(10) unsigned NOT NULL,
  `emitted` int(10) unsigned NOT NULL,
  `errCount` int(10) unsigned NOT NULL,
  `limitCount` int(10) unsigned NOT NULL,
  `scrubGeoCount` int(10) unsigned NOT NULL,
  `statusWithheldCount` int(10) unsigned NOT NULL,
  `totalProcessed` int(10) unsigned NOT NULL,
  `tweetCount` int(10) unsigned NOT NULL,
  `userWithheldCount` int(10) unsigned NOT NULL,
  `warningCount` int(10) unsigned NOT NULL,
  `stuffToTrack` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs statistics for every run and keywordchange' AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_track`
--
-- Creation: Nov 06, 2012 at 10:00 PM
--

CREATE TABLE IF NOT EXISTS `wut_track` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Track ID',
  `track` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '400 tracks can be active at the same time',
  `begin` datetime NOT NULL COMMENT 'Datetime when to start the search for the track',
  `end` datetime NOT NULL COMMENT 'Datetime when to end the search for the track',
  `authorized_by` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'Webuser, who entered the search',
  PRIMARY KEY (`ID`),
  KEY `track` (`track`(191),`begin`,`end`,`authorized_by`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table that stores keywords and hashtags to be searched.' AUTO_INCREMENT=47 ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_tweets`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_tweets` (
  `id` bigint(20) unsigned NOT NULL COMMENT 'The integer representation of the unique identifier for this Tweet. This number is greater than 53 bits and some programming languages may have difficulty/silent defects in interpreting it.',
  `annotations` text COLLATE utf8mb4_unicode_ci COMMENT 'At time of development. This feature is not implemented by twitter. Will be stored as JSON-object here, if implemented',
  `created_at` datetime NOT NULL COMMENT 'UTC time when this Tweet was created.',
  `current_user_retweet` bigint(20) unsigned DEFAULT NULL COMMENT 'Perspectival. Only surfaces on methods supporting the include_my_retweet parameter, when set to true. Details the Tweet ID of the user''s own retweet (if existent) of this Tweet.',
  `favorited` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Perspectival. Indicates whether this Tweet has been favorited by the authenticating user.',
  `geo` text COLLATE utf8mb4_unicode_ci COMMENT 'Deprecated. Nullable. Use the "coordinates" field instead. If still used will be JSON-object.',
  `in_reply_to_screen_name` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. If the represented Tweet is a reply, this field will contain the screen name of the original Tweet''s author.',
  `in_reply_to_status_id` bigint(20) unsigned DEFAULT NULL COMMENT 'Nullable. If the represented Tweet is a reply, this field will contain the integer representation of the original Tweet''s ID.',
  `in_reply_to_user_id` bigint(20) unsigned DEFAULT NULL COMMENT 'Nullable. If the represented Tweet is a reply, this field will contain the integer representation of the original Tweet''s author ID.',
  `place` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'string, not an integer! Nullable. When present, indicates that the tweet is associated (but not necessarily originating from) a Place.',
  `possibly_sensitive` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. This field only surfaces when a tweet contains a link. The meaning of the field doesn''t pertain to the tweet content itself, but instead it is an indicator that the URL contained in the tweet may contain content or media identified as sensitive content.',
  `possibly_sensitive_editable` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON-object. A set of key-value pairs indicating the intended contextual delivery of the containing Tweet. Currently used by Twitter''s Promoted Products.',
  `retweet_count` int(10) unsigned DEFAULT NULL COMMENT 'Number of times this Tweet has been retweeted. This field is no longer capped at 99 and will not turn into a String for "100+"',
  `retweeted` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Perspectival. Indicates whether this Tweet has been retweeted by the authenticating user.',
  `source` text COLLATE utf8mb4_unicode_ci COMMENT 'Utility used to post the Tweet, as an HTML-formatted string. Tweets from the Twitter website have a source value of web.',
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The actual UTF-8 text of the status update. See twitter-text for details on what is currently considered valid characters.',
  `truncated` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Indicates whether the value of the text parameter was truncated, for example, as a result of a retweet exceeding the 140 character Tweet length. Truncated text will end in ellipsis, like this ...',
  `user` bigint(20) unsigned NOT NULL COMMENT 'The user who posted this Tweet.',
  `withheld_copyright` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present and set to "true", it indicates that this piece of content has been withheld due to a DMCA complaint',
  `withheld_in_countries` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates a textual representation of the two-letter country codes this content is withheld from.',
  `withheld_scope` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates whether the content being withheld is the "status" or a "user."',
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Here come the tweets';

--
-- RELATIONS FOR TABLE `wut_tweets`:
--   `current_user_retweet`
--       `wut_users` -> `id`
--   `in_reply_to_status_id`
--       `wut_tweets` -> `id`
--   `in_reply_to_user_id`
--       `wut_users` -> `id`
--   `place`
--       `wut_places` -> `id`
--   `user`
--       `wut_users` -> `id`
--

--
-- Triggers `wut_tweets`
--
DROP TRIGGER IF EXISTS `tweets_after_del`;
DELIMITER //
CREATE TRIGGER `tweets_after_del` AFTER DELETE ON `wut_tweets`
 FOR EACH ROW BEGIN
  DELETE FROM wut_contributors WHERE tweet_id=OLD.id;
  DELETE FROM wut_geo_objects WHERE tweet_id=OLD.id;
  DELETE FROM wut_hashtags WHERE tweet_id=OLD.id;
  DELETE FROM wut_media WHERE tweet_id=OLD.id;
  DELETE FROM wut_unknown_tweet_objs WHERE tweet_id=OLD.id;
  DELETE FROM wut_urls WHERE tweet_id=OLD.id;
  DELETE FROM wut_user_mentions WHERE tweet_id=OLD.id;
 END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_tweet_media`
--
-- Creation: Sep 01, 2012 at 03:41 PM
--

CREATE TABLE IF NOT EXISTS `wut_tweet_media` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'id of parrent tweet',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of from the tweets media array',
  `media_id` bigint(20) unsigned NOT NULL COMMENT 'ID of the media expressed as a 64-bit integer',
  PRIMARY KEY (`tweet_id`,`index_of`,`media_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONS FOR TABLE `wut_tweet_media`:
--   `media_id`
--       `wut_media` -> `id`
--   `tweet_id`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_unknown_tweet_objs`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_unknown_tweet_objs` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'tweet_id of the parrent tweet',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'timestamp of the creation of the parrent tweet',
  `unknown` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'field with a JSON array of unknown tweet objects and attributes',
  PRIMARY KEY (`tweet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='table to store not recognized tweet attributes';

--
-- RELATIONS FOR TABLE `wut_unknown_tweet_objs`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_unknown_user_objs`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_unknown_user_objs` (
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'user_id of the parrent user',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'timestamp of user creation',
  `unknown` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'field with a JSON array of unknown user objects and attributes',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='table to store not recognized user attributes, for future upgrades and debugging';

--
-- RELATIONS FOR TABLE `wut_unknown_user_objs`:
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_urls`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_urls` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'Id of tweet',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of from the tweets url array',
  `display_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Version of the URL to display to clients.',
  `expanded_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Expanded version of display_url.',
  `x1` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the first character of the URL in the Tweet text',
  `x2` tinyint(3) unsigned NOT NULL COMMENT 'represents the location of the first non-URL character after the end of the URL',
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The t.co wrapped URL, corresponding to the value embedded directly into the raw Tweet text',
  PRIMARY KEY (`tweet_id`,`index_of`),
  KEY `expanded_url` (`expanded_url`(25))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Represents URLs included in the text of the Tweet.';

--
-- RELATIONS FOR TABLE `wut_urls`:
--   `tweet_id`
--       `wut_tweets` -> `id`
--

--
-- Triggers `wut_urls`
--
DROP TRIGGER IF EXISTS `urls_ins`;
DELIMITER //
CREATE TRIGGER `urls_ins` AFTER INSERT ON `wut_urls`
 FOR EACH ROW BEGIN
  INSERT INTO wut_urls_resolved
   SET tweet_id=NEW.tweet_id, index_of=NEW.index_of, resolve_index_of=0,
    expanded_url=NEW.expanded_url, resolved='false';
 END
//
DELIMITER ;
DROP TRIGGER IF EXISTS `urls_del`;
DELIMITER //
CREATE TRIGGER `urls_del` AFTER DELETE ON `wut_urls`
 FOR EACH ROW BEGIN
  DELETE FROM wut_urls_resolved
   WHERE tweet_id=OLD.tweet_id AND index_of=OLD.index_of;
 END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_urls_resolved`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_urls_resolved` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'id des tweets',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'nth URL in tweet',
  `resolve_index_of` tinyint(3) unsigned NOT NULL COMMENT 'nth resolve of resulting URL e.g. fb.me -> bit.ly -> tinyurl.com -> final Real URL',
  `expanded_url` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'url to resolve',
  `resolved` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'is this chain completely resolved?',
  `statuscode` smallint(5) unsigned DEFAULT NULL COMMENT 'HTTP status codes, when URI was processed',
  `httpVersion` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Server Protocol of the response',
  `contentType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Content type of the response',
  `date` datetime DEFAULT NULL COMMENT 'Date the responding server send back',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of this server',
  PRIMARY KEY (`tweet_id`,`index_of`,`resolve_index_of`),
  KEY `resolved` (`resolved`),
  KEY `statuscode` (`statuscode`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Storing expanded URLs after Twitters own expansion';

--
-- RELATIONS FOR TABLE `wut_urls_resolved`:
--   `statuscode`
--       `wut_http_statuscodes` -> `value`
--   `tweet_id`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_users`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_users` (
  `id` bigint(20) unsigned NOT NULL COMMENT 'The integer representation of the unique identifier for this User. This number is greater than 53 bits and some programming languages may have difficulty/silent defects in interpreting it.',
  `contributors_enabled` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Indicates that the user has an account with "contributor mode" enabled, allowing for Tweets issued by the user to be co-authored by another account. Rarely true.',
  `created_at` datetime DEFAULT NULL COMMENT 'The UTC datetime that the user account was created on Twitter.',
  `default_profile` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has not altered the theme or background of their user profile.',
  `default_profile_image` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has not uploaded their own avatar and a default egg avatar is used instead.',
  `description` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. The user-defined UTF-8 string describing their account.',
  `favourites_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of tweets this user has favorited in the account''s lifetime.',
  `follow_request_sent` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Perspectival. When true, indicates that the authenticating user has issued a follow request to this protected user account.',
  `following` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Perspectival. Deprecated. When true, indicates that the authenticating user is following this user. Some false negatives are possible when set to "false," but these false negatives are increasingly being represented as "null" instead.',
  `followers_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of followers this account currently has. Under certain conditions of duress, this field will temporarily indicate "0."',
  `friends_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of users this account is following (AKA their "followings"). Under certain conditions of duress, this field will temporarily indicate "0."',
  `geo_enabled` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has enabled the possibility of geotagging their Tweets.',
  `is_translator` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user is a participant in Twitter''s translator community',
  `lang` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The ISO 639-1 two-letter character code for the user''s self-declared user interface language. May or may not have anything to do with the content of their Tweets.',
  `listed_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of public lists that this user is a member of.',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. The user-defined location for this account''s profile. Not necessarily a location nor parseable. This field will occasionally be fuzzily interpreted by the Search service.',
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The name of the user, as they''ve defined it. Not necessarily a person''s name. Typically capped at 20 characters, but subject to change.',
  `notifications` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Deprecated. May incorrectly report "false" at times. Indicates whether the authenticated user has chosen to receive this user''s tweets by SMS.',
  `profile_background_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color chosen by the user for their background.',
  `profile_background_image_url` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTP-based URL pointing to the background image the user has uploaded for their profile.',
  `profile_background_image_url_https` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTPS-based URL pointing to the background image the user has uploaded for their profile.',
  `profile_background_tile` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user''s profile_background_image_url should be tiled when displayed.',
  `profile_banner_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Undocumented field in Twitter API',
  `profile_image_url` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTP-based URL pointing to the user''s avatar image.',
  `profile_image_url_https` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTPS-based URL pointing to the user''s avatar image.',
  `profile_link_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display links with in their Twitter UI.',
  `profile_sidebar_border_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display sidebar borders with in their Twitter UI.',
  `profile_sidebar_fill_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display sidebar backgrounds with in their Twitter UI.',
  `profile_text_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display text with in their Twitter UI.',
  `profile_use_background_image` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates the user wants their uploaded background image to be used.',
  `protected` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that this user has chosen to protect their Tweets.',
  `screen_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The screen name, handle, or alias that this user identifies themselves with. screen_names are unique but subject to change. Use id_str as a user identifier whenever possible. Typically a maximum of 15 characters long, but some historical accounts may exist with longer names.',
  `show_all_inline_media` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Indicates that the user would like to see media inline. Somewhat disused.',
  `status` bigint(20) unsigned DEFAULT NULL COMMENT 'Nullable. Last Tweet_id. If possible, the user''s most recent tweet or retweet. In some circumstances, this data cannot be provided and this field will be omitted, null, or empty.',
  `statuses_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of tweets (including retweets) issued by the user.',
  `time_zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. A string describing the Time Zone this user declares themselves within.',
  `url` text COLLATE utf8mb4_unicode_ci COMMENT 'Nullable. A URL provided by the user in association with their profile.',
  `utc_offset` int(10) unsigned DEFAULT NULL COMMENT 'Nullable. The offset from GMT/UTC in seconds.',
  `verified` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has a verified account.',
  `withheld_in_countries` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates a textual representation of the two-letter country codes this user is withheld from.',
  `withheld_scope` enum('status','user') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates whether the content being withheld is the "status" or a "user." ',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Twitter user data';

--
-- RELATIONS FOR TABLE `wut_users`:
--   `status`
--       `wut_tweets` -> `id`
--

--
-- Triggers `wut_users`
--
DROP TRIGGER IF EXISTS `user_log_after_ins`;
DELIMITER //
CREATE TRIGGER `user_log_after_ins` AFTER INSERT ON `wut_users`
 FOR EACH ROW INSERT INTO wut_users_backlog SET back_id=NULL, `timestamp`=NOW(),
 id=NEW.id, contributors_enabled=NEW.contributors_enabled, created_at=NEW.created_at,
 default_profile=NEW.default_profile, default_profile_image=NEW.default_profile_image,
 description=NEW.description, favourites_count=NEW.favourites_count,
 follow_request_sent=NEW.follow_request_sent, following=NEW.following,
 followers_count=NEW.followers_count, friends_count=NEW.friends_count,
 geo_enabled=NEW.geo_enabled, is_translator=NEW.is_translator, lang=NEW.lang,
 listed_count=NEW.listed_count, location=NEW.location, name=NEW.name,
 notifications=NEW.notifications, profile_background_color=NEW.profile_background_color,
 profile_background_image_url=NEW.profile_background_image_url,
 profile_background_image_url_https=NEW.profile_background_image_url_https,
 profile_background_tile=NEW.profile_background_tile,
 profile_banner_url=NEW.profile_banner_url,
 profile_image_url=NEW.profile_image_url,
 profile_image_url_https=NEW.profile_image_url_https,
 profile_link_color=NEW.profile_link_color,
 profile_sidebar_border_color=NEW.profile_sidebar_border_color,
 profile_sidebar_fill_color=NEW.profile_sidebar_fill_color,
 profile_text_color=NEW.profile_text_color,
 profile_use_background_image=NEW.profile_use_background_image,
 protected=NEW.protected, screen_name=NEW.screen_name,
 show_all_inline_media=NEW.show_all_inline_media, status=NEW.status,
 statuses_count=NEW.statuses_count, time_zone=NEW.time_zone, url=NEW.url,
 utc_offset=NEW.utc_offset, verified=NEW.verified,
 withheld_in_countries=NEW.withheld_in_countries,
 withheld_scope=NEW.withheld_scope
//
DELIMITER ;
DROP TRIGGER IF EXISTS `user_log_after_upd`;
DELIMITER //
CREATE TRIGGER `user_log_after_upd` AFTER UPDATE ON `wut_users`
 FOR EACH ROW INSERT INTO wut_users_backlog
SET back_id=NULL, `timestamp`=NOW(), id=NEW.id,
 contributors_enabled=NEW.contributors_enabled, created_at=NEW.created_at,
 default_profile=NEW.default_profile, default_profile_image=NEW.default_profile_image,
 description=NEW.description, favourites_count=NEW.favourites_count,
 follow_request_sent=NEW.follow_request_sent, following=NEW.following,
 followers_count=NEW.followers_count, friends_count=NEW.friends_count,
 geo_enabled=NEW.geo_enabled, is_translator=NEW.is_translator, lang=NEW.lang,
 listed_count=NEW.listed_count, location=NEW.location, name=NEW.name,
 notifications=NEW.notifications, profile_background_color=NEW.profile_background_color,
 profile_background_image_url=NEW.profile_background_image_url,
 profile_background_image_url_https=NEW.profile_background_image_url_https,
 profile_background_tile=NEW.profile_background_tile,
 profile_banner_url=NEW.profile_banner_url,
 profile_image_url=NEW.profile_image_url,
 profile_image_url_https=NEW.profile_image_url_https,
 profile_link_color=NEW.profile_link_color,
 profile_sidebar_border_color=NEW.profile_sidebar_border_color,
 profile_sidebar_fill_color=NEW.profile_sidebar_fill_color,
 profile_text_color=NEW.profile_text_color,
 profile_use_background_image=NEW.profile_use_background_image,
 protected=NEW.protected, screen_name=NEW.screen_name,
 show_all_inline_media=NEW.show_all_inline_media, status=NEW.status,
 statuses_count=NEW.statuses_count, time_zone=NEW.time_zone, url=NEW.url,
 utc_offset=NEW.utc_offset, verified=NEW.verified,
 withheld_in_countries=NEW.withheld_in_countries,
 withheld_scope=NEW.withheld_scope
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `wut_users_backlog`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_users_backlog` (
  `back_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID of the loging',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'timestamp of the loging',
  `id` bigint(20) unsigned NOT NULL COMMENT 'The integer representation of the unique identifier for this User. This number is greater than 53 bits and some programming languages may have difficulty/silent defects in interpreting it.',
  `contributors_enabled` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Indicates that the user has an account with "contributor mode" enabled, allowing for Tweets issued by the user to be co-authored by another account. Rarely true.',
  `created_at` datetime DEFAULT NULL COMMENT 'The UTC datetime that the user account was created on Twitter.',
  `default_profile` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has not altered the theme or background of their user profile.',
  `default_profile_image` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has not uploaded their own avatar and a default egg avatar is used instead.',
  `description` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. The user-defined UTF-8 string describing their account.',
  `favourites_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of tweets this user has favorited in the account''s lifetime.',
  `follow_request_sent` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Perspectival. When true, indicates that the authenticating user has issued a follow request to this protected user account.',
  `following` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Perspectival. Deprecated. When true, indicates that the authenticating user is following this user. Some false negatives are possible when set to "false," but these false negatives are increasingly being represented as "null" instead.',
  `followers_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of followers this account currently has. Under certain conditions of duress, this field will temporarily indicate "0."',
  `friends_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of users this account is following (AKA their "followings"). Under certain conditions of duress, this field will temporarily indicate "0."',
  `geo_enabled` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has enabled the possibility of geotagging their Tweets.',
  `is_translator` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user is a participant in Twitter''s translator community',
  `lang` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The ISO 639-1 two-letter character code for the user''s self-declared user interface language. May or may not have anything to do with the content of their Tweets.',
  `listed_count` int(11) unsigned DEFAULT NULL COMMENT 'The number of public lists that this user is a member of.',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. The user-defined location for this account''s profile. Not necessarily a location nor parseable. This field will occasionally be fuzzily interpreted by the Search service.',
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The name of the user, as they''ve defined it. Not necessarily a person''s name. Typically capped at 20 characters, but subject to change.',
  `notifications` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. Deprecated. May incorrectly report "false" at times. Indicates whether the authenticated user has chosen to receive this user''s tweets by SMS.',
  `profile_background_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color chosen by the user for their background.',
  `profile_background_image_url` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTP-based URL pointing to the background image the user has uploaded for their profile.',
  `profile_background_image_url_https` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTPS-based URL pointing to the background image the user has uploaded for their profile.',
  `profile_background_tile` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user''s profile_background_image_url should be tiled when displayed.',
  `profile_banner_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Undocumented field in Twitter API',
  `profile_image_url` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTP-based URL pointing to the user''s avatar image.',
  `profile_image_url_https` text COLLATE utf8mb4_unicode_ci COMMENT 'A HTTPS-based URL pointing to the user''s avatar image.',
  `profile_link_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display links with in their Twitter UI.',
  `profile_sidebar_border_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display sidebar borders with in their Twitter UI.',
  `profile_sidebar_fill_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display sidebar backgrounds with in their Twitter UI.',
  `profile_text_color` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The hexadecimal color the user has chosen to display text with in their Twitter UI.',
  `profile_use_background_image` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates the user wants their uploaded background image to be used.',
  `protected` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that this user has chosen to protect their Tweets.',
  `screen_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The screen name, handle, or alias that this user identifies themselves with. screen_names are unique but subject to change. Use id_str as a user identifier whenever possible. Typically a maximum of 15 characters long, but some historical accounts may exist with longer names.',
  `show_all_inline_media` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Indicates that the user would like to see media inline. Somewhat disused.',
  `status` bigint(20) unsigned DEFAULT NULL COMMENT 'Nullable. Last Tweet_id. If possible, the user''s most recent tweet or retweet. In some circumstances, this data cannot be provided and this field will be omitted, null, or empty.',
  `statuses_count` int(10) unsigned DEFAULT NULL COMMENT 'The number of tweets (including retweets) issued by the user.',
  `time_zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nullable. A string describing the Time Zone this user declares themselves within.',
  `url` text COLLATE utf8mb4_unicode_ci COMMENT 'Nullable. A URL provided by the user in association with their profile.',
  `utc_offset` int(10) unsigned DEFAULT NULL COMMENT 'Nullable. The offset from GMT/UTC in seconds.',
  `verified` enum('false','true') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When true, indicates that the user has a verified account.',
  `withheld_in_countries` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates a textual representation of the two-letter country codes this user is withheld from.',
  `withheld_scope` enum('status','user') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'When present, indicates whether the content being withheld is the "status" or a "user." ',
  PRIMARY KEY (`back_id`),
  KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Twitter user data' AUTO_INCREMENT=14873 ;

--
-- RELATIONS FOR TABLE `wut_users_backlog`:
--   `id`
--       `wut_users` -> `id`
--   `status`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_user_mentions`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_user_mentions` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT 'Id of tweet',
  `index_of` tinyint(3) unsigned NOT NULL COMMENT 'Index of from the tweets user_mentions array',
  `id` bigint(20) unsigned NOT NULL COMMENT 'ID of the mentioned user, as an integer.',
  `x1` tinyint(4) unsigned NOT NULL COMMENT 'represents the location of the ''@'' character of the user mention',
  `x2` tinyint(4) unsigned NOT NULL COMMENT 'represents the location of the first non-screenname character following the user mention',
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display name of the referenced user.',
  `screen_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Screen name of the referenced user.',
  PRIMARY KEY (`tweet_id`,`index_of`),
  KEY `id` (`id`),
  KEY `name` (`name`(20)),
  KEY `screen_name` (`screen_name`(15))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Represents other Twitter users mentioned in the text of the Tweet.';

--
-- RELATIONS FOR TABLE `wut_user_mentions`:
--   `id`
--       `wut_users` -> `id`
--   `tweet_id`
--       `wut_tweets` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_user_withheld`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_user_withheld` (
  `user_id` int(10) unsigned NOT NULL COMMENT 'indicating the user ID',
  `withheld_in_countries` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'a collection of withheld_in_countries two-letter country codes',
  `processed` enum('false','true') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'false' COMMENT 'has this notice been processed?',
  PRIMARY KEY (`user_id`),
  KEY `processed` (`processed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='These messages indicate that either the indicated tweet or indicated user has ha';

--
-- RELATIONS FOR TABLE `wut_user_withheld`:
--   `user_id`
--       `wut_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `wut_warnings`
--
-- Creation: Sep 01, 2012 at 01:44 AM
--

CREATE TABLE IF NOT EXISTS `wut_warnings` (
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestmp of warning',
  `code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Warning Code',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Warning message',
  `percent_full` double DEFAULT NULL COMMENT 'Percentage of backfill messages in queue',
  PRIMARY KEY (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Warnings from the Twitter API';

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;