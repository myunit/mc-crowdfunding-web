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

function FoundingItems(url, number, status, type) {
	var o = {};
	o.url = url;
	o.status = status;
	o.type = type;
	o.pageSize = number;
	o.pageId = 0;
	o.addItems = function (cb) {
		var self = this;
		ajaxPost(this.url, {
			fundingStatus: o.status,
			fundingType: o.type,
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
						equityImg: []
					},
					methods: {
						goToDetail: goToDetail
					}
				});

				function goToDetail(index) {
					location.href = '/invest/invest-ongoing?id=' + vm.equityList[index].SysNo;
				}

				var foundingItem = new FoundingItems('/invest/get-all-funding', 20, '[0,1,10,11]', '[1,3]');
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
					var status = parseInt($('#selectStatus').children('option:selected').val());
					if (status === 0) {
						status = '[0]';
					} else if (status === 1) {
						status = '[1]';
					} else if (status === 2) {
						status = '[10,11]';
					} else {
						status = '[0,1,10,11]';
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
					foundingItem = new FoundingItems('/invest/get-all-funding', 20, status, type);
					vm.equityList.splice(0, vm.equityList.length);
					vm.equityImg.splice(0, vm.proudctImg.length);
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

				$('#selectSource').change(function () {
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
						contentH = $(this).get(0).scrollHeight,//内容高度
						scrollTop = $(this).scrollTop();//滚动高度
					//if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
					if (scrollTop / (contentH - viewH) >= 0.95 && vm.equityList < vm.count) { //到达底部100px时,加载新内容
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
						imgList: []
					},
					methods: {
						reserve: reserve,
						goToBuy: goToBuy
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

				$('.popup-video').magnificPopup({
					disableOn: 700,
					type: 'iframe',
					mainClass: 'mfp-fade',
					removalDelay: 160,
					preloader: false,

					fixedContentPos: false
				});

				ajaxPost('/invest/get-funding-detail', {fundingId: parseInt(search['id'])}, function (err, data) {
					if (err) {
						toastr.error(err, '错误');
					} else {
						if (data.count === 1) {
							vm.funding = Utils.clone(data.funding);
							vm.imgList = data.img.slice();
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
							return this.num * this.funding.UnitPercent*100;
						},
						amount: function () {
							return this.num * this.funding.UnitPrice;
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

					if (vm.num > vm.funding.PerCustomerLimit) {
						toastr.warning('超出限购数量');
						vm.num = oldVal;
						return;
					}

					ajaxPost('/invest/add-funding-order', {
						fundingId: parseInt(search['id']),
						"quantity": vm.num,
						"price": vm.amount*100
					}, function (err, data) {
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