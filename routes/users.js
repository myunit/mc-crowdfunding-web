var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/my-pre-order', function(req, res, next) {
  res.render('my-pre-order', { title: '美仓众筹' });
});

router.get('/my-invest-list', function(req, res, next) {
  res.render('my-invest-list', { title: '美仓众筹' });
});

router.get('/my-product-list', function(req, res, next) {
  res.render('my-product-list', { title: '美仓众筹' });
});

router.get('/my-process-view', function(req, res, next) {
  res.render('my-process-view', { title: '美仓众筹' });
});

module.exports = router;
