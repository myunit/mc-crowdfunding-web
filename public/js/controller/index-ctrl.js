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
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入11位手机号码</label>';
						return;
					}

					if (!myreg.test(vm.username)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">手机号码不正确</label>';
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
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入11位手机号码</label>';
						return;
					}

					if (!myreg.test(vm.username)) {
						a = document.getElementById("id-label");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">手机号码不正确</label>';
						return;
					}

					if (!vm.captcha) {
						a = document.getElementById("captcha-label");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入验证码</label>';
						return;
					}

					if (!vm.password) {
						a = document.getElementById("pass-label");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">密码不能为空</label>';
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

				vm.$watch('phone', function (newVal, oldVal) {
					var myreg = /^[1][358][0-9]{9}$/;
					var a = document.getElementById("phone");
					if (!newVal) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入11位手机号码</label>';
						return;
					}

					if (!myreg.test(newVal)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">手机号码不正确</label>';
						return;
					}
					a.innerHTML = '';
				});

				vm.$watch('password', function (newVal, oldVal) {
					var a = document.getElementById("password");;
					if (!newVal || (newVal.length < 6 || newVal.length > 15)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">6-15位密码</label>';
						return;
					}
					a.innerHTML = '';

					a = document.getElementById("repassword");
					if (vm.password != newVal) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">密码输入不一致</label>';
						return;
					}
					a.innerHTML = '';
				});

				vm.$watch('repassword', function (newVal, oldVal) {
					var a = document.getElementById("repassword");
					if (!newVal) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请确认密码</label>';
						return;
					}

					if (vm.password != newVal) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">密码输入不一致</label>';
						return;
					}
					a.innerHTML = '';
				});

				vm.$watch('wechat', function (newVal, oldVal) {
					var a = document.getElementById("wechat");
					if (!newVal) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入微信号</label>';
						return;
					}
					a.innerHTML = '';
				});

				vm.$watch('validate', function (newVal, oldVal) {
					var a = document.getElementById("validate");
					if (!newVal) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 100px;">请输入验证码</label>';
						return;
					}

					var checkCode = vm.checkCode.replace(/\s+/g, "");
					if (newVal !== checkCode) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 100px;">验证码不正确</label>';
						return;
					}
					a.innerHTML = '';
				});

				vm.$watch('captcha', function (newVal, oldVal) {
					var a = document.getElementById("captcha");
					if (newVal) {
						a.innerHTML = '';
						return;
					}
				});

				$('#sendActiveCode').click(function (e) {
					e.preventDefault();
					var myreg = /^[1][358][0-9]{9}$/;
					if (vm.isSendCaptcha) {
						return;
					}
					var a = null;
					if (!vm.phone) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入11位手机号码</label>';
						return;
					}
					if (!myreg.test(vm.phone)) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">手机号码不正确</label>';
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
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入11位手机号码</label>';
						return;
					}
					if (!myreg.test(vm.phone)) {
						a = document.getElementById("phone");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">电话号码不正确</label>';
						return;
					}
					if (!vm.wechat) {
						a = document.getElementById("wechat");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入微信号</label>';
						return;
					}
					if (!vm.password || (vm.password && (vm.password.length < 6 || vm.password.length > 15))) {
						a = document.getElementById("password");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">6-15位密码</label>';
						return;
					}

					if (!vm.repassword) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请确认密码</label>';
						return;
					}

					if (vm.password != vm.repassword) {
						a = document.getElementById("repassword");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">密码输入不一致</label>';
						return;
					}

					if (!vm.validate) {
						a = document.getElementById("validate");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入验证码</label>';
						return;
					}

					var checkCode = vm.checkCode.replace(/\s+/g, "");
					if (vm.validate !== checkCode) {
						a = document.getElementById("validate");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 100px;">验证码不正确</label>';
						return;
					}

					if (!vm.captcha) {
						a = document.getElementById("captcha");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 100px;">请输入激活码</label>';
						return;
					}

					$('.my-box').loading({
						message: '校验激活码...'
					});
					ajaxPost('/check-captcha', {phone: vm.phone, captcha: vm.captcha}, function (err, data) {
						$('.my-box').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/reg-info?phone=' + vm.phone + '&wechat=' + encodeURI(encodeURI(vm.wechat)) + '&password=' + vm.password + '&captcha=' + vm.captcha;
						}
					});

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
				var i = 0;
				var el = '<select class="dropdown" name="" id="selectedP"  size="1" validate="{required:\'请选择省\'}">';
				el += '<option value="">请选择省</option>';
				for (i = 0;i < vm.province.length; i++) {
					var p = vm.province[i];
					el += '<option value="'+ p.id +'">' + p.name + '</option>';
				}
				el += '</select>';
				$("#userArea").after(el);

				el = '<select class="dropdown" name="" id="selectedC" size="1" validate="{required:\'请选择市\'}">';
				el += '<option value="">请选择市</option>';
				for (i = 0;i < vm.city.length; i++) {
					var c = vm.city[i];
					el += '<option value="'+ c.id +'">' + c.name + '</option>';
				}
				el += '</select>';
				$("#selectedP").after(el);

				el = '<select class="dropdown" name="" id="selectedD"  size="1" validate="{required:\'请选择区\'}">';
				el += '<option value="">请选择区</option>';
				for (i = 0;i < vm.district.length; i++) {
					var d = vm.district[i];
					el += '<option value="'+ d.id +'">' + d.name + '</option>';
				}
				el += '</select>';
				$("#selectedC").after(el);

				Vue.nextTick(function () {
					$('#selectedP').easyDropDown({cutOff: 5});
					$('#selectedC').easyDropDown({cutOff: 5});
					$('#selectedD').easyDropDown({cutOff: 5});
				});

				function changeCity () {
					var cityId = parseInt($('#selectedC').children('option:selected').val());
					vm.district = Utils.getDistrict(cityId).slice();

					el = '<select class="dropdown" name="" id="selectedD"  size="1" validate="{required:\'请选择区\'}">';
					el += '<option value="">请选择区</option>';
					for (i = 0;i < vm.district.length; i++) {
						var d = vm.district[i];
						el += '<option value="'+ d.id +'">' + d.name + '</option>';
					}
					el += '</select>';
					$('#userArea').next().next().next().replaceWith(el);
					Vue.nextTick(function () {
						$('#selectedD').easyDropDown('destroy');
						$('#selectedD').easyDropDown({cutOff: 5});
					});
				}

				$('#selectedP').change(function () {
					var provinceId = parseInt($('#selectedP').children('option:selected').val());
					vm.city = Utils.getCity(provinceId).slice();
					vm.district = Utils.getDistrict(vm.city[0].id).slice();

					el = '<select class="dropdown" name="" id="selectedC" size="1" validate="{required:\'请选择市\'}">';
					el += '<option value="">请选择市</option>';
					for (i = 0;i < vm.city.length; i++) {
						var c = vm.city[i];
						el += '<option value="'+ c.id +'">' + c.name + '</option>';
					}
					el += '</select>';
					$('#userArea').next().next().replaceWith(el);

					el = '<select class="dropdown" name="" id="selectedD"  size="1" validate="{required:\'请选择区\'}">';
					el += '<option value="">请选择区</option>';
					for (i = 0;i < vm.district.length; i++) {
						var d = vm.district[i];
						el += '<option value="'+ d.id +'">' + d.name + '</option>';
					}
					el += '</select>';
					$('#userArea').next().next().next().replaceWith(el);

					Vue.nextTick(function () {
						$('#selectedC').easyDropDown('destroy');
						$('#selectedD').easyDropDown('destroy');
						$('#selectedC').easyDropDown({cutOff: 5});
						$('#selectedD').easyDropDown({cutOff: 5});
						$('#selectedC').change(function () {
							changeCity();
						});
					});

				});

				$('#selectedC').change(function () {
					changeCity();
				});


				vm.$watch('name', function (newVal, oldVal) {
					var a = document.getElementById("name");
					if (newVal) {
						a.innerHTML = '';
						return;
					}
				});

				vm.$watch('id', function (newVal, oldVal) {
					var a = document.getElementById("id");
					// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
					var isIDCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
					if (!newVal) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入身份证号</label>';
						return;
					}

					if (!isIDCard.test(newVal)) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">身份证号不正确</label>';
						return;
					}

					a.innerHTML = '';
				});

				vm.$watch('email', function (newVal, oldVal) {
					var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
					var a = document.getElementById("email");
					if (newVal && !myreg.test(newVal)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">邮箱格式不正确</label>';
						return;
					}

					a.innerHTML = '';
				});

				vm.$watch('address', function (newVal, oldVal) {
					var a = document.getElementById("address");
					if (newVal) {
						a.innerHTML = '';
						return;
					}
				});

				$("#reg-info-next").click(function () {
					/*邮箱*/
					var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

					// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
					var isIDCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
					var a = null;
					if (!vm.name) {
						a = document.getElementById("name");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入真实姓名</label>';
						return;
					}
					if (!vm.id) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入身份证号</label>';
						return;
					}

					if (!isIDCard.test(vm.id)) {
						a = document.getElementById("id");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">身份证号不正确</label>';
						return;
					}
					if (vm.email && !myreg.test(vm.email)) {
						a = document.getElementById("email");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">邮箱格式不正确</label>';
						return;
					}
					if (!vm.address) {
						a = document.getElementById("address");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请输入详细地址</label>';
						return;
					}

					var pId = parseInt($('#selectedP').children('option:selected').val());
					var cId = parseInt($('#selectedC').children('option:selected').val());
					var dId = parseInt($('#selectedD').children('option:selected').val());
					if (isNaN(pId) || isNaN(cId) || isNaN(dId)) {
						a = document.getElementById("area");
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">请选择省市区</label>';
						return;
					}
					var pName = $('#selectedP').children('option:selected').text();
					var cName = $('#selectedC').children('option:selected').text();
					var dName = $('#selectedD').children('option:selected').text();

					var pcdCode = pId + '-' + cId + '-' + dId;
					var pcdDes = pName + '-' + cName + '-' + dName;
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
					var a = document.getElementById("licence-alert");
					var b = document.getElementById("shop-name");
					a.innerHTML = '';
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
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
					var a = document.getElementById("licence-alert");
					var b = document.getElementById("shop-name");
					a.innerHTML = '';
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
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
					var a = document.getElementById("licence-alert");
					var b = document.getElementById("shop-name");
					a.innerHTML = '';
					if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
						b.focus();
						return;
					}

					var fsize = this.files[0].size;
					if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
					{
						a.innerHTML = '<label style="font-size:14px;color:red;margin-left: 90px;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
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