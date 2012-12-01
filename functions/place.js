/*properties
    attributes, bounding_box, coordinates, country, country_code, exports,
    format, full_name, id, isArray, join, length, name, place_type, push,
    stringify, type, url
*/
var format = require('util').format,
    isArray = require('util').isArray,
    /**
     * Static string template for VALUES of the INSERT-statement
     * @type {string}
     */
    insPlacesBoundingBoxCoordinatesValue = '(%s, %d, %d, %d)',
    /**
     * Static String for the first part of the INSERT-statement template
     * @type {string}
     */
    insPlacesBoundingBoxCoordinates = 'INSERT INTO ' +
        'wut_places_bounding_box_coordinates (place_id, index_of, longitude, ' +
        'latitude) VALUES %s ON DUPLICATE KEY UPDATE ' +
        'longitude=VALUES(longitude), latitude=VALUES(latitude);',
    /**
     * Static String for the REPLACE-statement
     * @type {string}
     */
    insPlaces = 'INSERT INTO wut_places (id, attributes, bounding_box,' +
        ' country, country_code, full_name, name, place_type, url) VALUES' +
        ' (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE' +
        ' attributes=VALUES(attributes), bounding_box=VALUES(bounding_box),' +
        ' country=VALUES(country), country_code=VALUES(country_code),' +
        ' full_name=VALUES(full_name), name=VALUES(name),' +
        ' place_type=VALUES(place_type), url=VALUES(url);';
/**
 * Returns the REPLACE-statement for the BoundingBox Coordinates Object.<br>
 * Represents a BoundingBox included in the text of a Place.
 * @param {object} bb represent a BoundingBOx which have been parsed
 *     out of the Place object.
 * @param {string} place_id id of the parrent place. SQL-escaped
 * @return {string}
 * @author Kai Koch
 */
function boundingBox(bb, place_id) {
    'use strict';
    var i = 0, len = 0, values = [], valuesCount = 0,
        /**
         * The longitude and latitude of the place's location, as an collection
         * of floats in the form of [longitude, latitude].<br>
         * Example:<br>
         * Type:"Point" [[ [-122.400612831116,37.7821120598956] ]]<br>
         * Type:"Polygon" [[[-77.119759,38.791645],[-76.909393,38.791645],
         *     [-76.909393,38.995548],[-77.119759,38.995548]]]
         * @type {array}
         */
        coordinates = [];
    if (isArray(bb.coordinates)) {
        switch (bb.type) {
        case "Point":
            // Bring Point Coordinates in line with other Coordinate types
            coordinates = [[bb.coordinates]];
            break;
        case "Polygon":
            coordinates = bb.coordinates;
            break;
        default:
            coordinates = bb.coordinates;
        }
        len = coordinates[0].length;
        for (i; i < len; i += 1) {
            valuesCount = values.push(
                format(insPlacesBoundingBoxCoordinatesValue,
                    place_id, i, coordinates[0][i][0], coordinates[0][i][1])
            );
        }
        if (valuesCount) {
            return format(insPlacesBoundingBoxCoordinates, values.join(', '));
        }
    }
    return '';
}

/**
 * Returns the REPLACE-statements for the Place object.
 * Representing the Twitter Place object.<br>
 * Places are specific, named locations with corresponding geo coordinates. They
 * can be attached to Tweets by specifying a place_id when tweeting. Tweets
 * associated with places are not necessarily issued from that location but
 * could also potentially be about that location.
 * Example: {"attributes":{},"bounding_box":{"coordinates":[[
 *     [-77.119759,38.791645],[-76.909393,38.791645],[-76.909393,38.995548],
 *     [-77.119759,38.995548]]],
 *     "type":"Polygon"},"country":"United States","country_code":"US",
 *     "full_name":"Washington, DC","id":"01fbe706f872cb32","name":"Washington",
   *   "place_type":"city",
 *     "url": "http://api.twitter.com/1/geo/id/01fbe706f872cb32.json"}
 * @param {object} plc
 * @param {funcrtion} sqlEscFunc
 * @return {string}
 * @author Kai Koch
 */
function place(plc, sqlEscFunc) {
    'use strict';
    var retVal = '',
        /**
         * ID representing this place. Note that this is represented as a
         * string, not an integer.<br>
         * Example: "7238f93a3e899af6"
         * @type {string}
         */
        id = sqlEscFunc(plc.id),
        /**
         * Contains a hash of variant information about the place. See About Geo
         * Place Attributes. Example: {"street_address": "795 Folsom St",
         *   "623:id": "210176","twitter": "twitter"}
         * Will be converted and stored as a JSON-string
         * @type {string}
         */
        attributes = 'null',
        /**
         * A bounding box of coordinates which encloses this place.
         * Example: {"coordinates":[[
         *     [2.2241006,48.8155414],[2.4699099,48.8155414],
         *     [2.4699099,48.9021461],[2.2241006,48.9021461]]],"type":"Polygon"}
         * @type {Coordinates}
         */
        bounding_box = null,
        /**
         * The type of data encoded in the coordinates property.
         * See also http://www.geojson.org/
         * @type {string}
         */
        bbType = 'null',
        /**
         * Name of the country containing this place. Example: "France"
         * @type {string}
         */
        country = 'null',
        /**
         * Shortened country code representing the country containing this
         * place.<br>
         * Example: "FR"
         * @type {string}
         */
        country_code = 'null',
        /**
         * Full human-readable representation of the place's name.
         * Example: "Paris, Paris"
         * @type {string}
         */
        full_name = 'null',
        /**
         * Short human-readable representation of the place's name.
         * Example: "Paris"
         * @type {string}
         */
        name = 'null',
        /**
         * The type of location represented by this place.<br>
         * Example: "city"
         * @type {string}
         */
        place_type = 'null',
        /**
         * URL representing the location of additional place metadata for this
         * place.<br>
         * Example: "http://api.twitter.com/1/geo/id/7238f93a3e899af6.json"
         * @type {string}
         */
        url = 'null';
    if (plc.attributes) {
        attributes = sqlEscFunc(JSON.stringify(plc.attributes));
        if (attributes === "{}") {
            attributes = 'null';
        }
    }
    if (plc.bounding_box) {
        bbType = sqlEscFunc(plc.bounding_box.type);
        bounding_box = boundingBox(plc.bounding_box, id);
    }
    if (plc.country) {
        country = sqlEscFunc(plc.country);
    }
    if (plc.country_code) {
        country_code = sqlEscFunc(plc.country_code);
    }
    if (plc.full_name) {
        full_name = sqlEscFunc(plc.full_name);
    }
    if (plc.name) {
        name = sqlEscFunc(plc.name);
    }
    if (plc.place_type) {
        place_type = sqlEscFunc(plc.place_type);
    }
    if (plc.url) {
        url = sqlEscFunc(plc.url);
    }
    retVal = format(insPlaces, id, attributes, bbType, country, country_code,
        full_name, name, place_type, url);
    if (bounding_box !== null) {
        retVal += '\n' + bounding_box;
    }
    return retVal;
}
module.exports = place;