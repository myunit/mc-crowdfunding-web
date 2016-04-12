/**
 * Created by WuYou on 2016/3/29.
 */
require.config({
	baseUrl: './js',
	paths: {
		'Vue': './lib/vue.min',
		'Utils': './lib/utils.min'
	},
	shim: {
		'Vue': {
			exports: 'Vue'
		},
		'Utils': {
			exports: 'Utils'
		}
	}
});

function ajaxPost(url, data, cb) {
	$.ajax({
		type: 'POST',
		url: url,
		data: data,
		timeout: 25000,
		success: function (data, status, xhr) {
			if (data.status) {
				cb(null, data);
			} else {
				cb(data.msg, null);
			}
		},
		error: function (xhr, errorType, error) {
			console.error(url + ' error: ' + errorType + '##' + error);
			cb('服务异常', null);
		}
	});
}

function createCode() {
	var code = '';
	var codeLength = 4;//验证码的长度
	var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');//所有候选组成验证码的字符，当然也可以用中文的

	for (var i = 0; i < codeLength; i++) {
		var charIndex = Math.floor(Math.random() * 36);
		code += '  ' + selectChar[charIndex];
	}

	return code;
}

require(['Vue', 'Utils'],
	function (Vue, Utils) {
		'use strict';
		Vue.config.delimiters = ['${', '}'];
		Vue.config.unsafeDelimiters = ['{!!', '!!}'];
		toastr.options = {
			"closeButton": true,
			"debug": false,
			"newestOnTop": false,
			"progressBar": false,
			"positionClass": "toast-top-center",
			"preventDuplicates": false,
			"onclick": null,
			"showDuration": "300",
			"hideDuration": "1000",
			"timeOut": "3000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		};

		if ($('#page-index').length > 0 ) {
			$(document).ready(function () {
				var vm = new Vue({
					el: '#page-index',
					data: {
						equityList: [],
						productList: [],
						equityImg: [],
						productImg: []
					},
					methods: {
						goDetailEquity: goDetailEquity,
						goDetailProduct: goDetailProduct
					}
				});

				function goDetailEquity (index) {
					location.href = '/invest/invest-ongoing?id=' + vm.equityList[index].SysNo;
				}

				function goDetailProduct (index) {
					location.href = '/product/product-ongoing?id=' + vm.productList[index].SysNo;
				}

				ajaxPost('/get-hot-funding-index', {'fundingType': '[2]'}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						vm.productList = data.funding.slice();
						vm.productImg = data.img.slice();
					}
				});

				ajaxPost('/get-hot-funding-index', {'fundingType': '[1,3]'}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						vm.equityList = data.funding.slice();
						vm.equityImg = data.img.slice();
					}
				});


			});
			return;
		}

		if ($('#page-login').length > 0 ) {
			/*登录*/
			$(document).ready(function () {
				var vm = new Vue({
					el: '#page-login',
					data: {
						username: '',
						password: '',
						captcha: '',
						captchaTip: '获取验证码',
						isSendCaptcha: false,
						isDisable: true,
						captchaMsg: ''
					}
				});

				$('#sendCaptcha').click(function (e) {
					e.preventDefault();
					var myreg = /^[1][358][0-9]{9}$/;
					if (vm.isSendCaptcha) {
						return;
					}
					var a = document.getElementById("id-label");
					a.innerHTML = '';
					if (!vm.username) {
						a.innerHTML = '<label style="font-size:14px;color:red;">11位手机号码</label>';
						return;
					}

					if (!myreg.test(vm.username)) {
						a.innerHTML = '<label style="font-size:14px;color:red;">手机号码不正确</label>';
						return;
					}


					ajaxPost('/send-captcha', {'phone': vm.username, 'type': 2}, function (err, data) {
						if (err) {
							toastr.error(err, '错误');
						} else {
							var time = 60;
							vm.captchaTip = time + '秒';
							vm.isSendCaptcha = true;
							vm.isDisable = false;
							vm.captchaMsg = '如果您未收到短信，请在60秒后再次获取';
							var sendCaptchaInterval = setInterval(function () {
								time--;
								if (time > 9) {
									vm.captchaTip = time + '秒';
								} else {
									vm.captchaTip = '0' + time + '秒';
								}
								if (time === 0) {
									vm.captchaTip = '获取验证码';
									vm.isSendCaptcha = false;
									vm.isDisable = true;
									vm.captchaMsg = '';
									clearInterval(sendCaptchaInterval);
								}
							}, 1000);
						}
					});
				});

				$("#login").click(function () {
					var myreg = /^[1][358][0-9]{9}$/;
					var a = null;
					if (!vm.username) {
						a = document.getElementById("id-label");
						a.innerHTML = '<label style="font-size:14px;color:red;">11位手机号码</label>';
						return;
					}

					if (!myreg.test(vm.username)) {
						a = document.getElementById("id-label");
						a.innerHTML = '<label style="font-size:14px;color:red;">手机号码不正确</label>';
						return;
					}

					if (!vm.captcha) {
						a = document.getElementById("captcha-label");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入验证码</label>';
						return;
					}

					if (!vm.password) {
						a = document.getElementById("pass-label");
						a.innerHTML = '<label style="font-size:14px;color:red;">密码不能为空</label>';
						return;
					}

					$('.home-login-box').loading({
						message: '登录中...'
					});

					ajaxPost('/login', {
						'phone': vm.username,
						'password': vm.password,
						'captcha': vm.captcha
					}, function (err, data) {
						$('.home-login-box').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/login-suc';
						}
					});
				});
			});
			return;
		}

		if ($('#page-reg-start').length > 0 ) {
			/*注册*/
			$(document).ready(function () {
				var vm = new Vue({
					el: '#page-reg-start',
					data: {
						phone: '',
						wechat: '',
						password: '',
						repassword: '',
						validate: '',
						captcha: '',
						captchaTip: '获取激活码',
						isSendCaptcha: false,
						isDisable: true,
						captchaMsg: '',
						checkCode: ''
					},
					methods: {
						changeCode: changeCode
					}
				});

				vm.checkCode = createCode();

				function changeCode() {
					vm.checkCode = createCode();
				}

				$('#sendActiveCode').click(function (e) {
					e.preventDefault();
					var myreg = /^[1][358][0-9]{9}$/;
					if (vm.isSendCaptcha) {
						return;
					}
					var a = null;
					if (!vm.phone) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;">11位手机号码</label>';
						return;
					}
					if (!myreg.test(vm.phone)) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;">手机号码不正确</label>';
						return;
					}

					ajaxPost('/send-captcha', {'phone': vm.phone, 'type': 1}, function (err, data) {
						if (err) {
							toastr.error(err, '错误');
						} else {
							var time = 60;
							vm.captchaTip = time + '秒';
							vm.isSendCaptcha = true;
							vm.isDisable = false;
							vm.captchaMsg = '如果您未收到短信，请在60秒后再次获取';
							var sendCaptchaInterval = setInterval(function () {
								time--;
								if (time > 9) {
									vm.captchaTip = time + '秒';
								} else {
									vm.captchaTip = '0' + time + '秒';
								}
								if (time === 0) {
									vm.captchaTip = '获取验证码';
									vm.isSendCaptcha = false;
									vm.isDisable = true;
									vm.captchaMsg = '';
									clearInterval(sendCaptchaInterval);
								}
							}, 1000);
						}
					});
				});

				$("#reg-start-next").click(function () {
					var myreg = /^[1][358][0-9]{9}$/;
					var a = null;
					if (!vm.phone) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入电话号码</label>';
						return;
					}
					if (!myreg.test(vm.phone)) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;">电话号码不正确</label>';
						return;
					}
					if (!vm.wechat) {
						a = document.getElementById("wechat");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入微信号</label>';
						return;
					}
					if (!vm.password || (vm.password && (vm.password.length < 6 || vm.password.length > 15))) {
						a = document.getElementById("password");
						a.innerHTML = '<label style="font-size:14px;color:red;">6-15位密码</label>';
						return;
					}

					if (!vm.repassword) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;">请确认密码</label>';
						return;
					}

					if (vm.password != vm.repassword) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;">密码输入不一致</label>';
						return;
					}

					if (!vm.validate) {
						a = document.getElementById("validate");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入验证码</label>';
						return;
					}

					var checkCode = vm.checkCode.replace(/\s+/g, "");
					if (vm.validate !== checkCode) {
						a = document.getElementById("validate");
						a.innerHTML = '<label style="font-size:14px;color:red;">验证码不正确</label>';
						return;
					}

					if (!vm.captcha) {
						a = document.getElementById("captcha");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入激活码</label>';
						return;
					}

					location.href = '/reg-info?phone=' + vm.phone + '&wechat=' + encodeURI(encodeURI(vm.wechat)) + '&password=' + vm.password + '&captcha=' + vm.captcha;
				});

			});
			return;
		}

		if ($('#page-reg-info').length > 0 ) {
			/*注册-基本信息*/
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['phone'] || !search['wechat'] || !search['password'] || !search['captcha']) {
					location.href = '/reg-start';
					return;
				}

				var vm = new Vue({
					el: '#page-reg-info',
					data: {
						name: '',
						id: '',
						email: '',
						address: '',
						qq: '',
						selectedP: null,
						selectedC: null,
						selectedD: null,
						province: [],
						city: [],
						district: []
					}
				});
				vm.province = Utils.getProvince().slice();
				vm.city = Utils.getCity(vm.province[0].id).slice();
				vm.district = Utils.getDistrict(vm.city[0].id).slice();
				vm.selectedP = Utils.clone(vm.province[0]);
				vm.selectedC = Utils.clone(vm.city[0]);
				vm.selectedD = Utils.clone(vm.district[0]);

				vm.$watch('selectedP', function (newVal, oldVal) {
					vm.city = Utils.getCity(newVal.id).slice();
					vm.district = Utils.getDistrict(vm.city[0].id).slice();
					vm.selectedC = Utils.clone(vm.city[0]);
					vm.selectedD = Utils.clone(vm.district[0]);
				});

				vm.$watch('selectedC', function (newVal, oldVal) {
					vm.district = Utils.getDistrict(newVal.id).slice();
					vm.selectedD = Utils.clone(vm.district[0]);
				});

				$("#reg-info-next").click(function () {
					/*邮箱*/
					var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

					/*15位身份证号*/
					var isIDCard1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;

					/*18位身份证号*/
					var isIDCard2 = /^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3})(\d|X)?$/;
					var a = null;
					if (!vm.name) {
						a = document.getElementById("name");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入真实姓名</label>';
						return;
					}
					if (!vm.id) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入身份证号</label>';
						return;
					}

					if (vm.id && (!isIDCard1.test(vm.id) && !isIDCard2.test(vm.id))) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;">身份证号不正确</label>';
						return;
					}
					if (vm.email && !myreg.test(vm.email)) {
						a = document.getElementById("email");
						a.innerHTML = '<label style="font-size:14px;color:red;">邮箱格式不正确</label>';
						return;
					}
					if (!vm.address) {
						a = document.getElementById("address");
						a.innerHTML = '<label style="font-size:14px;color:red;">请输入详细地址</label>';
						return;
					}
					var pcdCode = vm.selectedP.id + '-' + vm.selectedC.id + '-' + vm.selectedD.id;
					var pcdDes = vm.selectedP.name + '-' + vm.selectedC.name + '-' + vm.selectedD.name;
					location.href = '/reg-platform' + location.search + '&name=' + encodeURI(encodeURI(vm.name)) + '&cardID=' + vm.id
					+ '&email=' + vm.email + '&pcdCode=' + pcdCode + '&pcdDes=' + encodeURI(encodeURI(pcdDes)) + '&address=' + vm.address + '&qq=' + vm.qq;
				});
			});
			return;
		}

		if ($('#page-reg-platform').length > 0 ) {
			var search = Utils.getSearch(location);
			if (!search['phone'] || !search['wechat'] || !search['password'] || !search['captcha'] ||
				!search['name'] || !search['cardID'] || !search['pcdCode'] ||
				!search['pcdDes'] || !search['address']) {
				location.href = '/reg-start';
				return;
			}
			/*平台选择*/
			$(document).ready(function () {
				var vm = new Vue({
					el: '#page-reg-platform',
					data: {
					},
					methods: {
						goToVerify: goToVerify
					}
				});

				function goToVerify (type, categoryId) {
					location.href = '/reg-platform-verify' + location.search + '&type=' + type + '&categoryId=' + categoryId;
				}
			});
			return;
		}

		if ($('#page-reg-verify').length > 0 ) {
			/*提交注册*/
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['phone'] || !search['wechat'] || !search['password'] || !search['captcha'] ||
					!search['name'] || !search['cardID'] || !search['pcdCode'] ||
					!search['pcdDes'] || !search['address'] || !search['type'] || !search['categoryId']) {
					location.href = '/reg-start';
					return;
				}

				var vm = new Vue({
					el: '#page-reg-verify',
					data: {
						licenceImg: '',
						workImg: '',
						weixinImg: '',
						storeType: '',
						storeName: '',
						productLink: '',
						shopName: '',
						platformName: '',
						bossWeixin: ''
					}
				});
				var type = parseInt(search['type']);
				if (type === 1) {
					$('.my-verify-nav li:eq(0)').addClass('active');
					$('.my-verify-content .tab-pane:eq(0)').addClass('active');
				} else if (type === 2) {
					$('.my-verify-nav li:eq(1)').addClass('active');
					$('.my-verify-content .tab-pane:eq(1)').addClass('active');
				} else if (type === 6) {
					$('.my-verify-nav li:eq(2)').addClass('active');
					$('.my-verify-content .tab-pane:eq(2)').addClass('active');
				} else if (type === 7) {
					$('.my-verify-nav li:eq(3)').addClass('active');
					$('.my-verify-content .tab-pane:eq(3)').addClass('active');
				} else {
					$('.my-verify-nav li:eq(0)').addClass('active');
					$('.my-verify-content .tab-pane:eq(0)').addClass('active');
				}

				$('#licence').change(function () {
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
						b.focus();
						return;
					}

					lrz(this.files[0], function (results) {
						// 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
						var base = results.base64.split(',');
						vm.licenceImg = base[1];
					});
				});

				$('#work-pic').change(function () {
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
						b.focus();
						return;
					}

					lrz(this.files[0], function (results) {
						// 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
						var base = results.base64.split(',');
						vm.workImg = base[1];
					});
				});

				$('#weixinPhoto').change(function () {
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						var a = document.getElementById("licence-alert");
						var b = document.getElementById("shop-name");
						a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
						b.focus();
						return;
					}

					lrz(this.files[0], function (results) {
						// 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
						var base = results.base64.split(',');
						vm.weixinImg = base[1];
					});
				});

				/*实体店验证*/
				$("#submit-reg-realshop").click(function () {
					$('.my-verify-content').loading({
						message: '提交中...'
					});
					var obj = {
						"phone": search['phone'],
						"password": search['password'],
						"captcha": search['captcha'],
						"address": search['address'],
						"IDNo": search['cardID'],
						"categoryId": search['categoryId'],
						"bossWeixin": '',
						"categoryType": search['type'],
						"detailCategory": '',
						"storeName": vm.shopName,
						"imgData": vm.licenceImg,
						"productLink": '',
						"email": search['email'] || '',
						"name":  decodeURI(search['name']),
						"pcdCode": search['pcdCode'],
						"pcdDes": decodeURI(search['pcdDes']),
						"qq": search['qq'] || '',
						"weixin": decodeURI(search['wechat'])
					};
					ajaxPost('/register', obj, function (err, data) {
						$('.my-verify-content').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/reg-success';
						}
					});
				});

				/* 网店验证*/
				$("#submit-reg-shop").click(function () {
					$('.my-verify-content').loading({
						message: '提交中...'
					});
					var obj = {
						"phone": search['phone'],
						"password": search['password'],
						"captcha": search['captcha'],
						"address": search['address'],
						"IDNo": search['cardID'],
						"categoryId": search['categoryId'],
						"bossWeixin": '',
						"categoryType": search['type'],
						"detailCategory": vm.storeType,
						"storeName": vm.storeName,
						"imgData": '',
						"productLink": vm.productLink,
						"email": search['email'] || '',
						"name":  decodeURI(search['name']),
						"pcdCode": search['pcdCode'],
						"pcdDes": decodeURI(search['pcdDes']),
						"qq": search['qq'] || '',
						"weixin": search['wechat']
					};
					ajaxPost('/register', obj, function (err, data) {
						$('.my-verify-content').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/reg-success';
						}
					});
				});

				/*平台采购验证*/
				$("#submit-reg-purchase").click(function () {
					$('.my-verify-content').loading({
						message: '提交中...'
					});
					var obj = {
						"phone": search['phone'],
						"password": search['password'],
						"captcha": search['captcha'],
						"address": search['address'],
						"IDNo": search['cardID'],
						"categoryId": search['categoryId'],
						"bossWeixin": '',
						"categoryType": search['type'],
						"detailCategory": '',
						"storeName": vm.platformName,
						"imgData": vm.workImg,
						"productLink": '',
						"email": search['email'] || '',
						"name":  decodeURI(search['name']),
						"pcdCode": search['pcdCode'],
						"pcdDes": decodeURI(search['pcdDes']),
						"qq": search['qq'] || '',
						"weixin": decodeURI(search['wechat'])
					};
					ajaxPost('/register', obj, function (err, data) {
						$('.my-verify-content').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/reg-success';
						}
					});
				});

				/*微商验证*/
				$("#submit-reg-weiChat").click(function () {
					$('.my-verify-content').loading({
						message: '提交中...'
					});
					var obj = {
						"phone": search['phone'],
						"password": search['password'],
						"captcha": search['captcha'],
						"address": search['address'],
						"IDNo": search['cardID'],
						"categoryId": search['categoryId'],
						"bossWeixin": vm.bossWeixin,
						"categoryType": search['type'],
						"detailCategory": '',
						"storeName": '',
						"imgData": vm.weixinImg,
						"productLink": '',
						"email": search['email'] || '',
						"name":  decodeURI(search['name']),
						"pcdCode": search['pcdCode'],
						"pcdDes": decodeURI(search['pcdDes']),
						"qq": search['qq'] || '',
						"weixin": decodeURI(search['wechat'])
					};
					ajaxPost('/register', obj, function (err, data) {
						$('.my-verify-content').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/reg-success';
						}
					});
				});
			});
			return;
		}

	});