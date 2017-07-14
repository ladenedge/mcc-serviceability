var assert = require('assert');
var sinon = require('sinon');
var request = require('request');
var Serviceability = require('../index');

var validConfig = {
    endpoint: 'https://mcc.com/svc',
    verbose: false,
};

var badStringValues = [null, "", " \t ", 1];


describe('constructor', function () {
    var requiredParams = ['endpoint'];

    it('should throw on undefined config', function() {
        assert.throws(() => new Serviceability(), Error);
    });
    it('should throw on null config', function() {
        assert.throws(() => new Serviceability(null), Error);
    });
    Object.keys(validConfig).forEach(prop => {
        it(`should throw on mistyped property ${prop}`, function() {
            let invalidConfig = Object.assign({}, validConfig);
            invalidConfig[prop] = function() { };
            assert.throws(() => new Serviceability(invalidConfig), TypeError);
        });
    });
    requiredParams.forEach(prop => {
        it(`should throw on undefined property ${prop}`, function() {
            let invalidConfig = Object.assign({}, validConfig);
            delete invalidConfig[prop];
            assert.throws(() => new Serviceability(invalidConfig), Error);
        });
        it(`should throw on null property ${prop}`, function() {
            let invalidConfig = Object.assign({}, validConfig);
            invalidConfig[prop] = null;
            assert.throws(() => new Serviceability(invalidConfig), Error);
        });
    });
    requiredParams.filter(v => typeof validConfig[v] === 'string').forEach(prop => {
        it(`should throw on empty string property ${prop}`, function() {
            let invalidConfig = Object.assign({}, validConfig);
            invalidConfig[prop] = "";
            assert.throws(() => new Serviceability(invalidConfig), Error);
        });
        it(`should throw on whitespace string property ${prop}`, function() {
            let invalidConfig = Object.assign({}, validConfig);
            invalidConfig[prop] = " \t ";
            assert.throws(() => new Serviceability(invalidConfig), Error);
        });
    });
    it(`should not throw when undefined property is not required`, function () {
        assert(typeof validConfig.proxy === 'undefined');
        new Serviceability(validConfig);
    });
    it(`should not throw when null property is not required`, function () {
        let config = Object.assign({}, validConfig);
        config.proxy = null;
        new Serviceability(config);
    });
    it('should not throw on valid config', function() {
        assert.doesNotThrow(() => new Serviceability(validConfig));
    });
    it('should set state', function () {
        var svc = new Serviceability(validConfig, 'key1=value1; key2=value2');
        var st = svc.cookies.getCookieString(validConfig.endpoint);
        assert.equal(st, 'key1=value1; key2=value2');
    });
});

['check', 'select'].forEach(ep => {

    describe(`${ep}()`, function () {
        var svc = new Serviceability(validConfig);
        var validAddress = {
            Address1: '718 25th St',
            Zip: '50312'
        };

        beforeEach(function () {
            // A Sinon stub replaces the target function, so no need for DI.
            this.post = sinon.stub(request, 'post');
        });
        afterEach(function () {
            request.post.restore();
        });

        it(`should throw on undefined address`, function () {
            assert.throws(() => svc[ep](), Error);
        });
        it(`should throw on null address`, function () {
            assert.throws(() => svc[ep](null), Error);
        });
        it(`should throw on mistyped address`, function () {
            assert.throws(() => svc[ep]('string'), Error);
        });
        ['Address1', 'Zip'].forEach(prop => {
            badStringValues.forEach(arg => {
                it(`should throw when ${prop} is '${arg}'`, function () {
                    var addr = Object.assign({}, validAddress);
                    addr[prop] = arg;
                    assert.throws(() => svc[ep](addr), Error);
                });
            });
        });
        it(`should throw when callback is wrong type`, function () {
            assert.throws(() => svc[ep](validAddress, 'string'), Error);
        });
        describe('request', function () {
            it(`should get correct url path`, function () {
                svc[ep](validAddress);
                assert.equal(this.post.firstCall.args[0], '/shop/' + ep);
            });
            [
                { key: 'baseUrl', val: validConfig.endpoint },
            ].forEach(opt => {
                it(`should get configured ${opt.key}`, function () {
                    svc[ep](validAddress);
                    assert.equal(this.post.firstCall.args[1][opt.key], opt.val);
                });
            });
            it(`should enable json`, function () {
                svc[ep](validAddress);
                assert(this.post.firstCall.args[1].json);
            });
            Object.keys(validAddress).forEach(key => {
                it(`should put ${key} property in body`, function () {
                    svc[ep](validAddress);
                    assert.equal(this.post.firstCall.args[1]['json'][key], validAddress[key]);
                });
                it(`should trim ${key} when it has extra whitespace`, function () {
                    var addr = Object.assign({}, validAddress);
                    addr[key] += '  ';
                    svc[ep](addr);
                    assert.equal(this.post.firstCall.args[1]['json'][key], validAddress[key]);
                });
            });
        });
        describe('response', function () {
            it(`should include error argument on error`, function (done) {
                var err = new Error('aaa');
                this.post.callsArgWith(2, err);

                svc[ep](validAddress, (err, rsp) => {
                    assert.equal(err.message, 'aaa');
                    done();
                });
            });
            it(`should include error argument on wrong WWW-Authenticate type`, function (done) {
                var rsp = { statusCode: 400 };
                this.post.callsArgWith(2, null, rsp);

                svc[ep](validAddress, (err, rsp) => {
                    assert(err.message.startsWith('Protocol error'));
                    done();
                });
            });
            it(`should succeed with message body`, function (done) {
                var rsp = { statusCode: 200 };
                var body = { test: 'aaa' };
                this.post.callsArgWith(2, null, rsp, body);

                svc[ep](validAddress, (err, rsp) => {
                    assert.equal(rsp.test, 'aaa');
                    done();
                });
            });
            it(`should succeed in verbose mode`, function (done) {
                var config = Object.assign({}, validConfig);
                config.verbose = true;
                var service = new Serviceability(config);
                var rsp = { statusCode: 200 };
                var body = { test: 'aaa' };
                this.post.callsArgWith(2, null, rsp, body);

                service[ep](validAddress, (err, rsp) => {
                    assert.equal(rsp.test, 'aaa');
                    done();
                });
            });
        });
    });
});

describe('state getter', function () {
    var svc = new Serviceability(validConfig);
    var validCookie = request.cookie('key=value');

    it('should return cookie', function () {
        svc.cookies.setCookie(validCookie, validConfig.endpoint);
        assert.equal(svc.state, 'key=value');
    });
});

describe('state setter', function () {
    badStringValues.forEach(val => {
        it(`should throw when value is '${val}'`, function () {
            var svc = new Serviceability(validConfig);
            assert.throws(() => { svc.state = val; });
        });
    });
    it('should set cookie', function () {
        var svc = new Serviceability(validConfig);
        svc.state = 'key=value';
        var st = svc.cookies.getCookieString(validConfig.endpoint);
        assert.equal(st, 'key=value');
    });
    it('should set multiple cookies', function () {
        var svc = new Serviceability(validConfig);
        svc.state = 'key1=value1; key2=value2';
        var st = svc.cookies.getCookieString(validConfig.endpoint);
        assert.equal(st, 'key1=value1; key2=value2');
    });
});
