-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 09. Mai 2013 um 22:59
-- Server Version: 5.5.16
-- PHP-Version: 5.3.8

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT=0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Datenbank: `wut`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wut_retweets`
--
-- Erzeugt am: 09. Mai 2013 um 20:52
--

CREATE TABLE `wut_retweets` (
  `tweet_id` bigint(20) unsigned NOT NULL COMMENT '64-bit Usigned ID of the tweet, that is a retweet',
  `retweet_of` bigint(20) unsigned DEFAULT NULL COMMENT '64-bit Usigned ID of the tweet, that is the original tweet',
  PRIMARY KEY (`tweet_id`),
  KEY `retweet_of` (`retweet_of`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relation retweet -> original tweet';

--
-- RELATIONEN DER TABELLE `wut_retweets`:
--   `retweet_of`
--       `wut_tweets` -> `id`
--   `tweet_id`
--       `wut_tweets` -> `id`
--
SET FOREIGN_KEY_CHECKS=1;
COMMIT;