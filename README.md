# mcc-serviceability API Proxy Module

[![Build Status](https://travis-ci.org/ladenedge/mcc-serviceability.svg?branch=master)](https://travis-ci.org/ladenedge/mcc-serviceability)
[![Coverage Status](https://coveralls.io/repos/github/ladenedge/mcc-serviceability/badge.svg)](https://coveralls.io/github/ladenedge/mcc-serviceability)
[![Dependencies Status](https://david-dm.org/ladenedge/mcc-serviceability/status.svg)](https://david-dm.org/ladenedge/mcc-serviceability)

This is a Node module to handle the client side of the MCC serviceability API.

## Installation

Install the module from [NPM](https://www.npmjs.com/package/mcc-serviceability).

    npm install mcc-serviceability

## Usage

Including the module in the source defines the mcc-serviceability class.  The constructor
for the class takes a configuration object.

    var Serviceability = require('mcc-serviceability');
    var svc = new Serviceability(config);

The class offers [a couple of functions](https://github.com/ladenedge/mcc-serviceability/wiki#mcc-serviceability),
most of which require a callback for success and error conditions:

    var callback = function(err, rsp) { };

Where `rsp` is the body of the (JSON) response, in object form, and `err` is an **Error**
object containing informtation about the failure.

## Full Example

    var Serviceability = require('mcc-serviceability');

    var config = {
        endpoint: 'https://sc.com/auth',
        verbose: false
    };
    var address = {
        Address1: '113 Penny Ln',
        Zip: '32459'
    };

    var svc = new Serviceability(config);
    svc.check(address, (err, rsp) => {
        if (err)
            return console.log(err);
        if (rsp.ResponseCode !== 'SingleSuccess')
            throw new Error('rsp.ResponseCode');

        svc.select(rsp.Addresses[0], (err, rsp) => {
            if (err)
                return console.log(err);

            console.log(config.endpoint + rsp.OffersUrl);
        });
    });

## License

This module is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright &copy; 2017, Verint Inc.
