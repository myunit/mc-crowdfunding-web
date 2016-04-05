/**
 * Created by WuYou on 2016/3/29.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/invest-list', function(req, res, next) {
    res.render('invest-list',{title:"美仓众筹"});
});

router.get('/invest-failed', function(req, res, next) {
    res.render('invest-failed',{title:"美仓众筹"});
});

router.get('/invest-ongoing', function(req, res, next) {
    res.render('invest-ongoing',{title:"美仓众筹"});
});

router.get('/invest-preheat', function(req, res, next) {
    res.render('invest-preheat',{title:"美仓众筹"});
});

router.get('/invest-success', function(req, res, next) {
    res.render('invest-success',{title:"美仓众筹"});
});

router.get('/invest-booking', function(req, res, next) {
    res.render('invest-booking',{title:"美仓众筹"});
});

router.get('/invest-booking-pay', function(req, res, next) {
    res.render('invest-booking-pay',{title:"美仓众筹"});
});
module.exports = router;