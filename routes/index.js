var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('default', { title: '美仓众筹'});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '美仓众筹' });
});

router.get('/login-suc', function(req, res, next) {
  //console.log(req);
  res.render('index', { title: '美仓众筹'});
});

router.get('/reg-start', function(req, res, next) {
  res.render('reg-start', { title: '美仓众筹' });
});

router.get('/reg-info', function(req, res, next) {
  res.render('reg-info', { title: '美仓众筹' });
});

router.post('/reg-platform', function(req, res, next) {
  res.render('reg-platform', { title: '美仓众筹' });
});

router.get('/reg-platform', function(req, res, next) {
  res.render('reg-platform', { title: '美仓众筹' });
});
router.get('/reg-platform-verify', function(req, res, next) {
  res.render('reg-platform-verify', { title: '美仓众筹' });
});

router.get('/reg-success', function(req, res, next) {
  res.render('reg-success', { title: '美仓众筹' });
});


module.exports = router;
