var express = require('express');
var unirest = require('unirest');
var ApiFactory = require('../common/api_config');
var fs = require('fs');
var Readable = require('stream').Readable;
var router = express.Router();
var path = require('path');

var api = ApiFactory.CreateApi();


/* GET home page. */
router.get('/', function (req, res, next) {
	if (req.session.uid) {
		delete req.session.uid;
		delete req.session.name;
	}
	res.render('default', {title: '美仓众筹'});
});

router.route('/login')
	.get(function (req, res, next) {
		res.render('login', {title: '美仓众筹'});
	})
	.post(function (req, res, next) {
		unirest.post(api.login())
			.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
			.send({"phone": req.body.phone, "password": req.body.password, "captcha": req.body.captcha})
			.end(function (response) {
				var data = response.body.repData;
				if (data === undefined) {
					res.json({status: 0, msg: '服务异常'});
					return;
				}
				if (data.status) {
					req.session.uid = data.customer.CustomerNo;
					req.session.name = data.customer.Name;
					res.json({status: data.status});
				} else {
					res.json({status: data.status, msg: data.msg});
				}
			});
	});

router.get('/login-suc', function (req, res, next) {
	if (req.session.uid) {
		res.render('index', {title: '美仓众筹', name: req.session.name});
	} else {
		res.redirect('/login');
	}
});

router.get('/reg-start', function (req, res, next) {
	res.render('reg-start', {title: '美仓众筹'});
});

router.get('/reg-info', function (req, res, next) {
	res.render('reg-info', {title: '美仓众筹'});
});

router.post('/reg-platform', function (req, res, next) {
	res.render('reg-platform', {title: '美仓众筹'});
});

router.get('/reg-platform', function (req, res, next) {
	res.render('reg-platform', {title: '美仓众筹'});
});
router.get('/reg-platform-verify', function (req, res, next) {
	res.render('reg-platform-verify', {title: '美仓众筹'});
});

router.get('/reg-success', function (req, res, next) {
	res.render('reg-success', {title: '美仓众筹'});
});


router.post('/send-captcha', function (req, res, next) {
	unirest.post(api.sendCaptcha())
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.send({"phone": req.body.phone, "type": parseInt(req.body.type)})
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
});

router.post('/register', function (req, res, next) {

	//save into disk
	var link = '';
	if (req.body.imgData) {
		var rs = new Readable;
		var buf = new Buffer(req.body.imgData, 'base64');
		rs.push(buf);
		rs.push(null);
		var opt = {flags: 'w', encoding: null, fd: null, mode: 0666, autoClose: true};
		var filePath = path.join(__dirname, '../public/images/verifty/');
		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath);
		}
		filePath += req.body.phone + '_' + (new Date()).getTime() + '.jpg';
		var writeStream = fs.createWriteStream(filePath, opt);
		rs.pipe(writeStream);
		rs = null;

		link = filePath.indexOf('/images');
		link = filePath.substring(link);
		link = 'http://wxp.xitie10.com:3100/' + link;
	}

	if (req.body.productLink) {
		link = req.body.productLink;
	}


	var obj = {
		"phone": req.body.phone,
		"password": req.body.password,
		"captcha": req.body.captcha,
		"address": req.body.address,
		"IDNo": req.body.IDNo,
		"categoryId": parseInt(req.body.categoryId),
		"bossWeixin": req.body.bossWeixin,
		"categoryType": parseInt(req.body.categoryType),
		"detailCategory": req.body.detailCategory,
		"storeName": req.body.storeName,
		"storeLink": link,
		"email": req.body.email,
		"name": req.body.name,
		"pcdCode": req.body.pcdCode,
		"pcd": req.body.pcdDes,
		"qq": req.body.qq,
		"weixin": req.body.weixin
	};

	unirest.post(api.register())
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
});

router.post('/get-hot-funding-index', function (req, res, next) {
	var obj = {
		"userId": req.session.uid,
		"pageId": 0,
		"pageSize": 2,
		"fundingType": JSON.parse(req.body.fundingType)
	};
	//console.log('obj: ' + JSON.stringify(obj));
	unirest.post(api.getHotFunding())
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.send(obj)
		.end(function (response) {
			var data = response.body.repData;
			if (data === undefined) {
				res.json({status: 0, msg: '服务异常'});
				return;
			}
			if (data.status) {
				res.json({status: data.status, funding: data.funding, img: data.img});
			} else {
				res.json({status: data.status, msg: data.msg});
			}
		});
});

module.exports = router;
