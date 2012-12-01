// Required Singelton Classes amd Wrapper
var DbWrapper = require('./classes/DbWrapper');
var Twit = require('twit');
var TwitWrapper = require('./classes/TwitWrapper');

// Database config and DbWrapper instance
var dbConfig = require('./dbConfig');
var dbh = new DbWrapper(dbConfig);

// twitter config and twitter (wrapper-)instance
var twitConfig = require('./twitConfig');
var t = new Twit(twitConfig);
var twitterWrapper = new TwitWrapper(t, dbh);