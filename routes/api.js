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

router.post('/cbbalance', function(req, res, next) {
    if(!req.query.token) {
        res.status(400).send('Did not specify token');
        return;
    }
});

router.get('/cbauth', function(req, res, next) {
    res.redirect("https://www.coinbase.com/oauth/authorize?response_type=code&client_id=" + keys.cbkey + "&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fcbcallback&state=134ef5504a94&scope=wallet:user:read,wallet:accounts:read");
});

router.get('/cbcallback', function(req, res, next) {
    //res.send(req.query);
/*    var postData = {
        'grant_type' : 'authorization_history',
        'code' : req.query.code,
        'client_id' : keys.cbkey,
        'client_secret' : keys.cbsecret,
        'redirect_uri' : 'localhost:3000/oauthfinal'
    }
    var options = {
        hostname: 'www.google.com',
        port: 80,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            //'Content-Length': postData.length
        }
    }*/

    var request = require('request');

    request({
        url: 'https://api.coinbase.com/oauth/token', //URL to hit
        qs: {
            'grant_type' : 'authorization_code',
            'code' : req.query.code,
            'client_id' : keys.cbkey,
            'client_secret' : keys.cbsecret,
            'redirect_uri' : 'http://localhost:3000/cbcallback'
        },
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }, function(error, response, body){
        if(error) {
            console.log(error);
            res.status(400).send("Shit.");
        } else {
            console.log(response.statusCode, body);
            res.send("Done");
        }
    });
});

router.get('/oauthfinal', function(req, res, next) {
    console.log(req.query);
});


var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/fox';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
});

module.exports = router;
