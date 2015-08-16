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
    var CbClient = require('coinbase').Client;
    var cbclient = new CbClient({'apiKey': keys.cbkey, 'apiSecret': keys.cbsecret});
    cbclient.getBuyPrice({'qty': 1, 'currency': 'USD'}, function(err, obj) {
        res.send(obj.total.amount);
    });
});

router.get('/chart', function(req, res, next) {
    blockchain.statistics.getChartData('market-price', function(error, data) {
        if(error) {
            res.status(500).send("Something bad happened");
            return;
        }
        var sma25 = simple_moving_averager(25);
        data.sma = [];
        for(var k in data.values) {
            var d = new Date(data.values[k].x * 1000); //js expects ms since epoch, this api provides sec.
            var fd = (d.getMonth() + 1) + "/" + d.getDate();
            data.values[k].x = fd;
            data.sma.push({
                    'x' : fd,
                    'y' : sma25(data.values[k].y)
                });
        }
        res.send(data);
    });
});

router.get('/chart/sma', function(req, res, next) {
    blockchain.statistics.getChartData('market-price', function(error, data) {
        if(error) {
            res.status(500).send("Something bad happened");
            return;
        }
        var sma = simple_moving_averager(parseInt(req.query.period));
        for(var i in data.values) {
            var d = new Date(data.values[i].x * 1000); //js expects ms since epoch, this api provides sec.
            data.values[i].x = (d.getMonth() + 1) + "/" + d.getDate();
            data.values[i].y = sma(data.values[i].y);
        }
        res.send(data);
    });
});

/**
 * http://rosettacode.org/wiki/Averages/Simple_moving_average#JavaScript
 */
function simple_moving_averager(period) {
    var nums = [];
    return function(num) {
        nums.push(num);
        if (nums.length > period)
            nums.splice(0,1);  // remove the first element of the array
        var sum = 0;
        for (var i in nums)
            sum += nums[i];
        var n = period;
        if (nums.length < period)
            n = nums.length;
        return(sum/n);
    }
}

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
    var client = new Client({'accessToken': req.query.token, 'refreshToken': req.query.refresh});
    var Account = require('coinbase').model.Account;
    client.getAccounts(function(err, accounts) {
        accounts.forEach(function(acct) {
            console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
        });
    });
});

router.get('/cbauth', function(req, res, next) {
    res.redirect("https://www.coinbase.com/oauth/authorize?response_type=code&client_id=" + keys.cbkey + "&redirect_uri=http%3A%2F%2F192.168.2.113:3000%2Fcbcallback&state=134ef5504a94&scope=wallet:user:read,wallet:accounts:read");
});

router.get('/cbcallback', function(req, res, next) {

    request({
        url: 'https://api.coinbase.com/oauth/token', //URL to hit
        qs: {
            'grant_type' : 'authorization_code',
            'code' : req.query.code,
            'client_id' : keys.cbkey,
            'client_secret' : keys.cbsecret,
            'redirect_uri' : 'http://192.168.2.113:3000/cbcallback'
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
            //res.send(JSON.stringify({
                //'access_token' : JSON.parse(body).access_token,
                //'refresh_token' : JSON.parse(body).refresh_token
            //}));
            res.redirect('fox://coinbase?access=' + JSON.parse(body).access_token + '&refresh=' + JSON.parse(body).refresh_token);
        }
    });
});

module.exports = router;
