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
		timeout: 15000,
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

		/*登录*/
		$('#page-login').ready(function () {
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

				ajaxPost('/login', {
					'phone': vm.username,
					'password': vm.password,
					'captcha': vm.captcha
				}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						location.href = '/login-suc';
					}
				});
			});
		});
		/*注册*/
		$('#page-reg-start').ready(function () {
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

			$('#sendActiveCode').click(function () {
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

				location.href = '/reg-info?phone=' + vm.phone + '&wechat=' + vm.wechat + '&password=' + vm.password + '&captcha=' + vm.captcha;
			});

		});

		/*注册-基本信息*/
		$('#page-reg-info').ready(function () {
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

			vm.$watch('selectedP', function (newVal, oldVal) {
				vm.city = Utils.getCity(newVal.id).slice();
				vm.district = Utils.getDistrict(vm.city[0].id).slice();
			});

			vm.$watch('selectedC', function (newVal, oldVal) {
				vm.district = Utils.getDistrict(newVal.id).slice();
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
				location.href = '/reg-platform' + location.search + '&name=' + vm.name + '&cardID=' + vm.id
				+ '&email=' + vm.email + '&pcdCode=' + pcdCode + '&pcdDes=' + pcdDes + '&address=' + vm.address;
			});

			/*实体店验证*/
			$("#submit-reg-realshop").click(function () {
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					//get the file size and file type from file input field
					if ($('#licence')[0].files[0]) {
						if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("licence").value)) {
							var a = document.getElementById("licence-alert");
							var b = document.getElementById("shop-name");
							a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
							b.focus();
							return;
						} else {
							var fsize = $('#licence')[0].files[0].size;
							if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
							{
								var a = document.getElementById("licence-alert");
								var b = document.getElementById("shop-name");
								a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
								b.focus();
								return;
							}
						}
					}
				}
				location.href = '/reg-success';
			});

			/* 网店验证*/
			$("#submit-reg-shop").click(function () {

				location.href = '/reg-success';
			});

			/*平台采购验证*/
			$("#submit-reg-purchase").click(function () {
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					//get the file size and file type from file input field
					if ($('#work-pic')[0].files[0]) {
						if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("work-pic").value)) {
							var a = document.getElementById("work-pic-alert");
							var b = document.getElementById("platform-name");
							a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　请选择png,jpeg,bmp格式照片上传</label>';
							b.focus();
							return;
						}
					}
				}
				location.href = '/reg-success';
			});

			/*微商验证*/
			$("#submit-reg-weiChat").click(function () {

				if (window.File && window.FileReader && window.FileList && window.Blob) {
					//get the file size and file type from file input field
					if ($('#picture')[0].files[0]) {
						if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("picture").value)) {
							var a = document.getElementById("picture-alert");
							var b = document.getElementById("weiChat-id");
							a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　请选择png,jpeg,bmp格式照片上传</label>';
							b.focus();
							return;
						}
					}
				}
				location.href = '/reg-success';
			});
		});
	});