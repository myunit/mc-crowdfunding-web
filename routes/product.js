/**
 * Created by WuYou on 2016/3/29.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/product-booking', function(req, res, next) {
    res.render('product-booking',{title:"美仓众筹"});
});

router.get('/product-booking-pay', function(req, res, next) {
    res.render('product-booking-pay',{title:"美仓众筹"});
});

router.get('/product-booking-pay-confirm', function(req, res, next) {
    res.render('product-booking-pay-confirm',{title:"美仓众筹"});
});

router.get('/product-failed', function(req, res, next) {
    res.render('product-failed',{title:"美仓众筹"});
});

router.get('/product-list', function(req, res, next) {
    res.render('product-list',{title:"美仓众筹"});
});

router.get('/product-ongoing', function(req, res, next) {
    res.render('product-ongoing',{title:"美仓众筹"});
});

router.get('/product-preheat', function(req, res, next) {
    res.render('product-preheat',{title:"美仓众筹"});
});

router.get('/product-success', function(req, res, next) {
    res.render('product-success',{title:"美仓众筹"});
});


module.exports = router;