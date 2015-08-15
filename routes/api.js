var express = require('express');
var router= express.Router();
var blockchain = require('blockchain.info');
var request = require('request');

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
    if(!req.query.refresh) {
        res.status(400).send('Did not specify refresh token');
        return;
    }
    var Client = require('coinbase').Client;
    var client = new Client({'accessToken': accessToken, 'refreshToken': refreshToken});
});

router.get('/cbauth', function(req, res, next) {
    res.redirect("https://www.coinbase.com/oauth/authorize?response_type=code&client_id=" + keys.cbkey + "&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fcbcallback&state=134ef5504a94&scope=wallet:user:read,wallet:accounts:read");
});

router.get('/cbcallback', function(req, res, next) {

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
            //res.send(response);
            res.send(JSON.stringify({
                'access_token' : JSON.parse(body).access_token,
                'refresh_token' : JSON.parse(body).refresh_token
            }));
        }
    });
});

router.get('/oauthfinal', function(req, res, next) {
    console.log(req.query);
});

module.exports = router;
