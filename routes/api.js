var express = require('express');
var router= express.Router();
var blockchain = require('blockchain.info');

router.post('/tx', function(req, res, next) {
    console.log(req.query);
    if(!req.query.guid) {
        res.status(400).send('Did not specify guid');
        return;
    }
    if(!req.query.password) {
        res.status(400).send('Did not specify password');
        return;
    }
    if(!req.query.to) {
        res.status(400).send('Did not specify to');
        return;
    }
    if(!req.query.amount) {
        res.status(400).send('Did not specify amount');
        return;
    }
    res.send('hello');
});

var keys = require('./keys');
var CbClient = require('coinbase').Client;
var cbclient = new CbClient({'apiKey': keys.cbkey,
    'apiSecret': keys.cbsecret,
    'baseApiUri': 'https://api.sandbox.coinbase.com/v1/',
    'tokenUri': 'https://api.sandbox.coinbase.com/oauth/token'
});

/**
 * Params:
 * to - btc address to send to
 * amount - amount of BTC, decimals accepted
 */
router.post('/cbtx', function(req, res, next) {
    if(!req.query.to) {
        res.status(400).send('Did not specify to');
        return;
    }
    if(!req.query.amount) {
        res.status(400).send('Did not specify amount');
        return;
    }
    if(!req.query.token) {
        res.status(400).send('Did not specify token');
        return;
    }
    var note = '';
    if(req.query.note) {
        note = req.query.note;
    }
});

router.get('/cbquote', function(req, res, next) {
    cbclient.getBuyPrice({'qty': 1, 'currency': 'USD'}, function(err, obj) {
        res.send(obj.total.amount);
    });
});

router.get('/cbbalance', function(req, res, next) {
    if(!req.query.token) {
        res.status(400).send('Did not specify token');
        return;
    }
});

module.exports = router;
