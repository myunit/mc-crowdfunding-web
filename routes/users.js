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
router.get('/my-pre-order', function(req, res, next) {
  res.render('my-pre-order', { title: '美仓众筹', name: req.session.name});
});

router.get('/my-invest-list', function(req, res, next) {
  res.render('my-invest-list', { title: '美仓众筹', name: req.session.name});
});

router.get('/my-product-list', function(req, res, next) {
  res.render('my-product-list', { title: '美仓众筹', name: req.session.name});
});

router.get('/my-process-view', function(req, res, next) {
  res.render('my-process-view', { title: '美仓众筹', name: req.session.name});
});

router.post('/get-reserve', function (req, res, next) {
  var obj = {
    "userId": req.session.uid,
    "pageId": parseInt(req.body.pageId),
    "pageSize": parseInt(req.body.pageSize)
  };

  unirest.post(api.getFundingReserve())
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

module.exports = router;
