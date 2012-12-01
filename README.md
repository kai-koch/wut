wut
===
__wut - "Working Up Twitter":__ tool to collect and store data from the Twitter Stream API for analysis and statistical evaluation

Version 0.1.0

TOC:
====
* [Purpose](README.md#purpose)
* [System requirements](README.md#system-requirements)
* [Quick install](README.md#quick-install)
* [Future development](README.md#future-development)
* [License](README.md#license)

Purpose:
========
This application connects to the public streaming endpoint of the Twitter API (1.1) and collects tweets based on the search the user entered. It is able to track up to 400 keywords, 5000 Users and 25 geo locations defined through bounding boxes. (This limits are due to the restrictions of Twitter.)
This application was developed during the course of a bachelor thesis, which miserably failed, because the author lacks the ability of meeting deadlines.

System requirements:
===================
+ This application has been tested on a single core 2.60 GHz CPU with 2 gb of RAM on windowsXP with a 16 mBit/s downstream connection and is able to cope with about 55 Tweet messages per second (about 4 million tweets per day). The application itselfs needs between 20 and 80 mb of RAM depending on OS and incomming traffic. The database should have a greater portion of memory depending on your system setup and hard disk speed.
+ __OS:__ tested on windows XP and debian linux, should work on any OS that meets the other requirments
+ __Plattform:__ node.js >= v0.8.8 should run on previous versions but is not tested

    *__needed node modules:__*
    * [node-mysql](https://github.com/felixge/node-mysql)
    * [twit](https://github.com/ttezel/twit)
 
+ __Datbase:__ MySQL 5.5.3 or higher    
    * To store the content of the tweets right you need to have utf8mb4 support. On older MySQL versions 4 bytes UTF-8 chars and emoji-codepoints are not stored correctly!

    * On Windows DO NOT install MySQL on a FAT-32 partiton or you will run into the 4 GB file limit of the FAT-32 filesystem very fast! Use NTFS on Windows instead.

    * If you expect high volume traffic from your Twitter tracks you may dedicate a whole partition to the database installation. Please see the MySQL manual on InnoDB setup.
    
    * You also might want to alter the standard MySQL configuration since 64mb Memory is a bit low for the database backend to handle higher volume traffic.
    
+ *Recommended:* a lot of diskspace on a fast hard disk and a nice chunk of RAM for the database! (Since it is the bottle neck of this application)

+ *Recommended:* For now a database frontend like phpMyAdmin, since a web frontend is not yet implemented. But through the database you can configure the searched tracks and access the collected data. (I use xampp, it comes with MySQL and phpMyAdmin and is easy to install on most systems - see: http://www.apachefriends.org)

+ *Recommended:* a fast internet connection with an adequate down stream. You do not need your own server. I devloped and tested this application from home with a cable connection (16 mBit/s = 2 MB/s downstream to connect to the sample stream endpoint of Twitter (peak: 55 msgs/s)). You should have at least a 165 kB/s down stream connection, or else you will be disconnected from the Twitter stream, because you are falling behind.

Quick install:
==============
* Install node.js (http://nodejs.org/)
* Install MySql (e.g. http://www.apachefriends.org)
* Download and unpack the source code to a directory of your choice
* Use npm in that directory to install the modules "node-mysql" and "twit" ("npm install"). This will put these required modules into the sub folder "node_modules"
* Create the needed tables with sql/CreateTables.sql and a MySQL-client of your choice
* Make the needed authentication keys on Twitter. Create twitConfig.js and dbConfig.js in the directory of the application. See: twitConfig.sample and dbConfig.sample as templates
* Insert your search terms into the tables "wut_follow", "wut_track" and "wut_locations"
* From the command prompt run "node twitterLoop.js"

Future development:
===================
Besides fixing bugs and improving performance, this application will get:
* Porper tests
* A proper web frontend, so the user, will not have to work directly through the database
* Language detection in real time
* Installation of the JavaScript core through npm

License:
========
(The MIT License)

Copyright (c) 2012 by Kai Koch kai.koch@gmail.com and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.