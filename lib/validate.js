"use strict"

/**
 * Validates a serviceability configuration object.
 *
 * @param {Object} config An object with properties corresponding to the schema parameter.
 * @param {Object} schema An array of objects defining the expected configuration elements.
 */
module.exports.validateConfig = function(config, schema) {
    if (config === null || typeof config === 'undefined')
        throw new Error('Null or undefined configuration data');

    schema.forEach(val => {
        if (!config.hasOwnProperty(val.key) || config[val.key] === null) {
            if (val.req)
                throw new Error(`'${val.key}' is required in the configuration`);
            else
                return;
        }
        if (typeof config[val.key] !== val.type)
            throw new TypeError(`${val.key} should be a(n) ${val.type}`);
        if (val.type === 'string')
            config[val.key] = validateString(config[val.key]);
    });

    return Object.assign({}, config);
}

/**
 * Validates a string argument.
 *
 * @param {string} s A string that may not be undefined or empty.
 * @param {string} argName The name of the argument to validate.
 * @returns {string} The trimmed, non-empty string.
 */
 var validateString = function (s, argName) {
    if (typeof s === 'undefined' || s === null)
        throw new Error(`Parameter '${argName}' was undefined or null`);
    if (typeof s !== 'string')
        throw new Error(`Parameter '${argName}' must be a non-empty string`);
    s = s.trim();
    if (s === '')
        throw new Error(`Parameter '${argName}' must be non-empty`);
    return s;
}
module.exports.validateString = validateString;

/**
 * Validates a response handler.
 *
 * @param {Serviceability~callback} callback The callback to validate.
 */
module.exports.validateCallback = function (callback) {
    if (!callback)
        return () => { };
    if (typeof callback !== 'function')
        throw new Error(`'callback' argument must be a function`)
    return callback;
}

/**
 * Validates an address object.
 *
 * @param {Object} addr An address object.
 * @param {string} addr.Address1 The first line of the address to check.
 * @param {string} [addr.City] The city of the address to check.
 * @param {string} [addr.State] The two-letter state code of the address to check.
 * @param {string} [addr.UnitNumber] The unit number of the address to check.
 * @param {string} addr.Zip The zip code of the address to check.
 */
module.exports.validateAddress = function (addr) {
    if (addr === null || typeof addr === 'undefined')
        throw new Error('Null or undefined address');
    if (typeof addr !== 'object')
        throw new Error('Address must be an object');
    addr.Value = validateString(addr.Address1, 'Address1');
    addr.Zip = validateString(addr.Zip, 'Zip');
}
