/**
 * Created by WuYou on 2016/3/29.
 */
require.config({
	baseUrl: '../js',
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

function toDecimal4(x) {
	var f = parseFloat(x);

	if (isNaN(f)) {
		return;
	}

	f = Math.round(x*10000)/10000;
	return f;
}

function toDecimal2(x) {
	var f = parseFloat(x);

	if (isNaN(f)) {
		return;
	}

	f = Math.round(x*100)/100;
	return f;
}

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

function FoundingItems(url, number, district, status, type, active) {
	var o = {};
	o.url = url;
	o.status = status;
	o.type = type;
	o.district = district;
	o.active = active;
	o.pageSize = number;
	o.pageId = 0;
	o.addItems = function (cb) {
		var self = this;
		ajaxPost(this.url, {
			fundingStatus: this.status,
			fundingType: this.type,
			fundingActive: this.active,
			districtId: this.district,
			pageId: this.pageId,
			pageSize: this.pageSize
		}, function (err, data) {
			if (err) {
				cb(err, null);
			} else {
				self.pageId++;
				cb(null, data);
			}
		});
	};
	return o;
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

		if ($('#page-invest-list').length > 0) {
			$(document).ready(function () {
				var vm = new Vue({
					el: '#page-invest-list',
					data: {
						count: 0,
						equityList: [],
						equityImg: [],
						district: []
					},
					methods: {
						goToDetail: goToDetail
					}
				});

				function goToDetail(index) {
					location.href = '/invest/invest-ongoing?id=' + vm.equityList[index].SysNo;
				}

				ajaxPost('/invest/get-district', {}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						vm.district = data.district.slice();

						var el = '<select class="dropdown" name="" id="selectDistrict">';
						el += '<option value="-1">全部</option>';
						for (var i = 0;i < vm.district.length; i++) {
							var dis = vm.district[i];
							el += '<option value="'+ dis.districtId +'">' + dis.districtName + '</option>';
						}
						el += '</select>';
						$("#brand").after(el);

						Vue.nextTick(function () {
							$('#selectDistrict').easyDropDown();
							$('#selectDistrict').change(function () {
								changeSelect();
							});
						});

					}
				});

				var foundingItem = new FoundingItems('/invest/get-all-funding', 20, -1, '[0,10,11]', '[1,3]', '[0,1,10]');
				foundingItem.addItems(function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						vm.equityList = data.funding.slice();
						vm.equityImg = data.img.slice();
						vm.count = data.count;
					}
				});

				function changeSelect() {
					var district = parseInt($('#selectDistrict').children('option:selected').val());

					var active = parseInt($('#selectStatus').children('option:selected').val());
					if (active === 0) {
						active = '[0]';
					} else if (active === 1) {
						active = '[1]';
					} else if (active === 2) {
						active = '[10]';
					} else {
						active = '[0,1,10]';
					}

					var type = parseInt($('#selectType').children('option:selected').val());
					if (type === 0) {
						type = '[1]';
					} else if (type === 1) {
						type = '[3]';
					} else {
						type = '[1,3]';
					}

					foundingItem = null;
					foundingItem = new FoundingItems('/invest/get-all-funding', 20, district, '[0,10,11]', type, active);
					vm.equityList.splice(0, vm.equityList.length);
					vm.equityImg.splice(0, vm.equityImg.length);
					foundingItem.addItems(function (err, data) {
						if (err) {
							toastr.error(err, '错误');
						} else {
							vm.equityList = data.funding.slice();
							vm.equityImg = data.img.slice();
							vm.count = data.count;
						}
					});
				}

				$('#selectDistrict').change(function () {
					changeSelect();
				});

				$('#selectType').change(function () {
					changeSelect();
				});

				$('#selectStatus').change(function () {
					changeSelect();
				});


				$(window).scroll(function () {
					var $this = $(this),
						viewH = $(this).height(),//可见高度
						contentH = document.body.scrollHeight==0?document.documentElement.scrollHeight:document.body.scrollHeight,//内容高度
						scrollTop = $(this).scrollTop();//滚动高度
					//if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
					if (scrollTop / (contentH - viewH) >= 0.95 && vm.equityList.length < vm.count) { //到达底部100px时,加载新内容
						foundingItem.addItems(function (err, data) {
							if (err) {
								toastr.error(err, '错误');
							} else {
								vm.equityList = vm.equityList.concat(data.funding);
								vm.equityImg = vm.equityImg.concat(data.img);
								vm.count = data.count;
							}
						});
					}
				});

			});
			return;
		}

		if ($('#page-invest-detail').length > 0) {
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['id']) {
					location.href = '/invest/invest-list';
					return;
				}
				var vm = new Vue({
					el: '#page-invest-detail',
					data: {
						count: 0,
						funding: null,
						imgList: [],
						swiperImg: []
					},
					methods: {
						reserve: reserve,
						goToBuy: goToBuy,
						switchSwiper : switchSwiper
					}
				});

				function goToBuy() {
					location.href = '/invest/invest-booking?id=' + search['id'];
				}

				function reserve() {
					$('.my-produtc-box').loading({
						message: '预约中...'
					});
					ajaxPost('/invest/add-funding-reserve', {fundingId: parseInt(search['id'])}, function (err, data) {
						$('.my-produtc-box').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							$('.bs-example-modal-sm').modal('show');
						}
					});
				}

				function switchSwiper (index) {
					$('#my-carousel').show();
					$('.ui-video-content').hide();
					var $video = $('.ui-video-content video');
					$video[0].currentTime = 0;
					$video[0].pause();
					$('#my-carousel').carousel(index);
				}

				function draw(video, thecanvas) {
					// get the canvas context for drawing
					var context = thecanvas.getContext('2d');
					// draw the video contents into the canvas x, y, width, height
					context.drawImage(video, 0, 0, thecanvas.width, thecanvas.height);
				}

				ajaxPost('/invest/get-funding-detail', {fundingId: parseInt(search['id'])}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						if (data.count === 1) {
							vm.funding = Utils.clone(data.funding);
							vm.imgList = data.img.slice();
							if (vm.imgList.length >= 8) {
								var $video = $('.ui-video-content video');
								$('source', $video).attr('src', vm.imgList[7].ImgValue.length > 0 ? vm.imgList[7].ImgValue[0]:'');
								var $videoCanvas = $('#videoCanvas');
								$video[0].onloadeddata=function () {
									draw($video[0], $videoCanvas[0]);
								};
								$video[0].load();
								//$video[0].currentTime = 0;
							}

							var i = 0;
							var key =  0;
							var imgList = vm.imgList[2].ImgValue;
							for (i = 0; i < imgList.length; i++) {
								vm.swiperImg.push({index: key, url: imgList[i]});
								key++;
							}

							imgList = vm.imgList[3].ImgValue;
							for (i = 0; i < imgList.length; i++) {
								vm.swiperImg.push({index: key, url: imgList[i]});
								key++;
							}

							imgList = vm.imgList[4].ImgValue;
							for (i = 0; i < imgList.length; i++) {
								vm.swiperImg.push({index: key, url: imgList[i]});
								key++;
							}

							imgList = vm.imgList[5].ImgValue;
							for (i = 0; i < imgList.length; i++) {
								vm.swiperImg.push({index: key, url: imgList[i]});
								key++;
							}

							imgList = vm.imgList[6].ImgValue;
							for (i = 0; i < imgList.length; i++) {
								vm.swiperImg.push({index: key, url: imgList[i]});
								key++;
							}
							$('#fn-video').click(function(e){
								e.preventDefault();
								$('#my-carousel').hide();
								$('.ui-video-content').show();
								var $video = $('.ui-video-content video');
								$video[0].play();
							});

							Vue.nextTick(function () {
								$('#my-carousel').carousel({
									interval: 4000
								});

								$('[id^=carousel-selector-]').click(function () {
									var id_selector = $(this).attr("id");
									var id = id_selector.substr(id_selector.length - 1);
									id = parseInt(id);
									$('#my-carousel').carousel(id);
									$('[id^=carousel-selector-]').removeClass('selected');
									$(this).addClass('selected');
								});

								$('#my-carousel').on('slid', function (e) {
									var id = $('.item.active').data('slide-number');
									id = parseInt(id);
									$('[id^=carousel-selector-]').removeClass('selected');
									$('[id=carousel-selector-' + id + ']').addClass('selected');
								});
							});
						} else {
							toastr.warning('该众筹已下架', '警告');
							setTimeout(function () {
								location.href = '/invest/invest-list';
							}, 2500);
						}
					}
				});

			});

			return;
		}

		if ($('#page-invest-booking').length > 0) {
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['id']) {
					location.href = '/invest/invest-list';
					return;
				}

				var vm = new Vue({
					el: '#page-invest-booking',
					data: {
						check_pro: false,
						num: 1,
						funding: null
					},
					computed: {
						percent: function () {
							return toDecimal4(this.num * this.funding.UnitPercent);
						},
						amount: function () {
							return toDecimal2(this.num * this.funding.UnitPrice);
						}
					},
					methods: {
						submitOrder: submitOrder
					}
				});

				ajaxPost('/invest/get-funding-detail', {fundingId: parseInt(search['id'])}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						if (data.count === 1) {
							vm.funding = Utils.clone(data.funding);
						}
					}
				});

				function submitOrder() {
					if (!vm.check_pro || !vm.funding) {
						return;
					}

					if (!vm.num) {
						toastr.warning('请填写正确的购买数量');
						return;
					}

					if (vm.funding.PerCustomerLimit > 0 && vm.num > vm.funding.PerCustomerLimit) {
						toastr.warning('超出限购数量');
						return;
					}

					$('.my-booking-box').loading({
						message: '提交订单...'
					});
					ajaxPost('/invest/add-funding-order', {
						fundingId: parseInt(search['id']),
						"quantity": vm.num,
						"price": vm.funding.UnitPrice*100
					}, function (err, data) {
						$('.my-booking-box').loading('stop');
						if (err) {
							toastr.error(err, '错误');
						} else {
							location.href = '/invest/invest-booking-pay?p=' + encodeURI(encodeURI(vm.amount));
						}
					});
				}
			});

			return;
		}

		if ($('#page-invest-pay').length > 0) {
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['p']) {
					location.href = '/invest/invest-list';
					return;
				}

				var vm = new Vue({
					el: '#page-invest-pay',
					data: {
						amount: decodeURI(search['p'])
					},
					methods: {
						confirm: confirm
					}
				});

				function confirm () {
					location.href = '/invest/invest-booking-pay-confirm?p=' + search['p'];
				}
			});

			return;
		}

		if ($('#page-invest-confirm').length > 0) {
			$(document).ready(function () {
				var search = Utils.getSearch(location);
				if (!search['p']) {
					location.href = '/invest/invest-list';
					return;
				}

				var vm = new Vue({
					el: '#page-invest-confirm',
					data: {
						amount: decodeURI(search['p'])
					}
				});
			});
			return;
		}

	});