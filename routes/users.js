var express = require('express');
var unirest = require('unirest');
var ApiFactory = require('../common/api_config');
var fs = require('fs');
var Readable = require('stream').Readable;
var router = express.Router();
var path = require('path');

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
    "pageSize": parseInt(req.body.pageSize),
    "publish": [1]
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

router.post('/get-order', function (req, res, next) {
  var obj = {
    "userId": req.session.uid,
    "orderId": parseInt(req.body.orderId) || -1,
    "pageId": parseInt(req.body.pageId),
    "pageSize": parseInt(req.body.pageSize),
    "fundingStatus": JSON.parse(req.body.fundingStatus),
    "fundingType": JSON.parse(req.body.fundingType),
    "fundingActive": parseInt(req.body.fundingActive),
    "orderStatus": parseInt(req.body.orderStatus),
    "payStatus": parseInt(req.body.payStatus),
    "returnStatus": parseInt(req.body.returnStatus)
  };
  unirest.post(api.getFundingOrder())
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

router.post('/cancel-order', function (req, res, next) {
  var obj = {
    "userId": req.session.uid,
    "orderId": parseInt(req.body.orderId)
  };

  var index = parseInt(req.body.index);
  unirest.post(api.cancelFundingOrder())
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send(obj)
      .end(function (response) {
        var data = response.body.repData;
        if (data === undefined) {
          res.json({status: 0, msg: '服务异常'});
          return;
        }
        if (data.status) {
          res.json({status: data.status, index: index});
        } else {
          res.json({status: data.status, msg: data.msg});
        }
      });
});

router.post('/finish-order', function (req, res, next) {

  //save into disk
  var imgData = JSON.parse(req.body.imgData);
  if (imgData.length) {
    var link = [];
    var url = '';
    var i = 0;
    var rs = null;
    var buf = null;
    var writeStream = null;
    var savePath = '';
    var opt = {flags: 'w', encoding: null, fd: null, mode: 0666, autoClose: true};
    var filePath = path.join(__dirname, '../public/images/pay/');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    for (i = 0;i < imgData.length; i++) {
      rs = new Readable;
      buf = new Buffer(imgData[i], 'base64');
      rs.push(buf);
      rs.push(null);
      savePath = filePath +  req.session.uid + '_' + req.body.orderId + '_' + (new Date()).getTime() + '_' + i + '.jpg';
      writeStream = fs.createWriteStream(savePath, opt);
      rs.pipe(writeStream);
      rs = null;
      buf = null;
      writeStream = null;

      url = savePath.indexOf('/images');
      url = savePath.substring(url);
      link.push('http://wxp.xitie10.com:3100/' + url);
    }

    var obj = {
      "userId": req.session.uid,
      "orderId": parseInt(req.body.orderId),
      "imgUrl": link
    };
    unirest.post(api.finishPayFunding())
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(obj)
        .end(function (response) {
          var data = response.body.repData;
          if (data === undefined) {
            res.json({status: 0, msg: '服务异常'});
            return;
          }
          if (data.status) {
            res.json({status: data.status});
          } else {
            res.json({status: data.status, msg: data.msg});
          }
        });
  } else {
    res.json({status: 0, msg: '支付凭证未上传'});
  }
});

router.post('/get-progress', function (req, res, next) {
  var obj = {
    "userId": req.session.uid,
    "pageId": parseInt(req.body.pageId),
    "pageSize": parseInt(req.body.pageSize),
    "fundingId": JSON.parse(req.body.fundingId)
  };

  unirest.post(api.getFundingProgress())
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send(obj)
      .end(function (response) {
        var data = response.body.repData;
        if (data === undefined) {
          res.json({status: 0, msg: '服务异常'});
          return;
        }
        if (data.status) {
          res.json({status: data.status, count: data.count, fundingType: data.fundingType, funding: data.funding, img: data.img});
        } else {
          res.json({status: data.status, msg: data.msg});
        }
      });
});


module.exports = router;
