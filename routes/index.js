var express = require('express');
var unirest = require('unirest');
var ApiFactory = require('../common/api_config');

var router = express.Router();

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

module.exports = router;
