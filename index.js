'use strict';

var request = require('request');
var validator = require('./lib/validate');

var configSchema = [
    { key: 'endpoint', type: 'string', req: true },
    { key: 'proxy', type: 'string', req: false },
    { key: 'verbose', type: 'boolean', req: false }
];

/**
 * A callback to handle both successful and failed requests.
 * @callback Serviceability~callback
 * @param {Error} err An Error object containing information about a failure, or null if the call succeeded.
 * @param {Object} response An object created from the body of the successful response.
 */

/**
 * Module for the MCC serviceability check.
 */
class Serviceability {
    /**
     * Constructs a Serviceability client with the supplied configuration.
     * @param {Object} config Configuration for the module.
     * @param {string} config.endpoint Full endpoint for the MCC serviceability API.
     * @param {boolean} [config.verbose] Whether to output detailed logging to stderr.
     */
    constructor(config) {
        this.config = validator.validateConfig(config, configSchema);
        this.cookies = request.jar();
    }

    /**
     * Checks an address for its serviceability.
     * @param {Object} address A string containing the username to authenticate.
     * @param {string} address.Address1 The first line of the address to check.
     * @param {string} [address.City] The city of the address to check.
     * @param {string} [address.State] The two-letter state code of the address to check.
     * @param {string} [address.UnitNumber] The unit number of the address to check.
     * @param {string} address.Zip The zip code of the address to check.
     * @param {Serviceability~callback} [callback] A response handler to be called when the function completes.
     */
    check(address, callback) {
        serviceability('/shop/check', this, address, callback);
    }

    /**
     * Select a serviceable address.
     * @param {Object} address An object containing the selected address.
     * @param {string} address.Address1 The first line of the address to select.
     * @param {string} [address.City] The city of the address to select.
     * @param {string} [address.State] The two-letter state code of the address to select.
     * @param {string} [address.UnitNumber] The unit number of the address to select.
     * @param {string} address.Zip The zip code of the address to select.
     * @param {string} address.LocationId The opaque location identifier of the address to select.
     * @param {string} address.UnitId The opaque unit identifier of the address to select.
     * @param {Serviceability~callback} [callback] A response handler to be called when the function completes.
     */
    select(address, callback) {
        serviceability('/shop/select', this, address, callback);
    }
};

function serviceability(url, svc, address, callback) {
    validator.validateAddress(address);
    callback = validator.validateCallback(callback);

    var opts = {
        baseUrl: svc.config.endpoint,
        jar: svc.cookies,
        proxy: svc.config.proxy,
        rejectUnauthorized: !svc.config.proxy,
        json: address
    };

    request.post(url, opts, (error, rsp, body) => {
        if (error)
            return callback(error);
        if (rsp.statusCode !== 200)
            return callback(new Error('Protocol error'));
        callback(null, body);
    });
};

module.exports = Serviceability;
