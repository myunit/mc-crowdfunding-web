/**
 * Created by WuYou on 2016/3/29.
 */
var express = require('express');
var unirest = require('unirest');
var ApiFactory = require('../common/api_config');
var router = express.Router();

var api = ApiFactory.CreateApi();

router.use(function (req, res, next) {
    if (req.session.uid) {
        next();
    } else {
        res.redirect('/');
    }
});

/* GET users listing. */
router.get('/product-booking', function(req, res, next) {
    res.render('product-booking',{title:"美仓众筹", name: req.session.name});
});

router.get('/product-booking-pay', function(req, res, next) {
    res.render('product-booking-pay',{title:"美仓众筹", name: req.session.name});
});

router.get('/product-booking-pay-confirm', function(req, res, next) {
    res.render('product-booking-pay-confirm',{title:"美仓众筹", name: req.session.name, amount: req.query.amount});
});

router.get('/product-failed', function(req, res, next) {
    res.render('product-failed',{title:"美仓众筹", name: req.session.name});
});

router.get('/product-list', function(req, res, next) {
    res.render('product-list', {title:"美仓众筹", name: req.session.name});
});

router.get('/product-ongoing', function(req, res, next) {
    res.render('product-ongoing',{title:"美仓众筹", name: req.session.name});
});

router.get('/product-preheat', function(req, res, next) {
    res.render('product-preheat',{title:"美仓众筹", name: req.session.name});
});

router.get('/product-success', function(req, res, next) {
    res.render('product-success',{title:"美仓众筹", name: req.session.name});
});

router.post('/get-all-funding', function (req, res, next) {
    var obj = {
        "userId": req.session.uid,
        "pageId": parseInt(req.body.pageId),
        "pageSize": parseInt(req.body.pageSize),
        "fundingStatus": JSON.parse(req.body.fundingStatus),
        "fundingType": JSON.parse(req.body.fundingType),
        "fundingActive": JSON.parse(req.body.fundingActive),
        "districtId": parseInt(req.body.districtId)
    };

    unirest.post(api.getAllFunding())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            var data = response.body.repData;
            if (data === undefined) {
                res.json({status: 0, msg: '服务异常'});
                return;
            }
            if (data.status) {
                res.json({status: data.status, count: data.count, funding: data.funding, img: data.img});
            } else {
                res.json({status: data.status, msg: data.msg});
            }
        });
});

router.post('/get-funding-detail', function (req, res, next) {
    var obj = {
        "userId": req.session.uid,
        "fundingId": parseInt(req.body.fundingId)
    };
    console.log('obj: ' + JSON.stringify(obj));
    unirest.post(api.getFundingDetail())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            var data = response.body.repData;
            if (data === undefined) {
                res.json({status: 0, msg: '服务异常'});
                return;
            }
            if (data.status) {
                res.json({status: data.status, count: data.count, funding: data.funding, img: data.img});
            } else {
                res.json({status: data.status, msg: data.msg});
            }
        });
});

router.post('/add-funding-reserve', function (req, res, next) {
    var obj = {
        "userId": req.session.uid,
        "fundingId": parseInt(req.body.fundingId)
    };
    unirest.post(api.addFundingReserve())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            var data = response.body.repData;
            if (data === undefined) {
                res.json({status: 0, msg: '服务异常'});
                return;
            }
            if (data.status) {
                res.json({status: data.status, msg: data.msg});
            } else {
                res.json({status: data.status, msg: data.msg});
            }
        });
});

router.post('/add-funding-order', function (req, res, next) {
    var obj = {
        "userId": req.session.uid,
        "fundingId": parseInt(req.body.fundingId),
        "quantity": parseInt(req.body.quantity),
        "price": parseInt(req.body.price)/100
    };

    unirest.post(api.addFundingOrder())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            var data = response.body.repData;
            if (data === undefined) {
                res.json({status: 0, msg: '服务异常'});
                return;
            }
            if (data.status) {
                res.json({status: data.status, count: data.count, funding: data.funding, img: data.img});
            } else {
                res.json({status: data.status, msg: data.msg});
            }
        });
});

router.post('/get-district', function (req, res, next) {
    var obj = {};
    unirest.post(api.getDistrict())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
            var data = response.body.repData;
            if (data === undefined) {
                res.json({status: 0, msg: '服务异常'});
                return;
            }
            if (data.status) {
                res.json({status: data.status, count: data.count, district: data.district});
            } else {
                res.json({status: data.status, msg: data.msg});
            }
        });
});

module.exports = router;