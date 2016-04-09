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

function ReserveItems(url, number) {
    var o = {};
    o.url = url;
    o.pageSize = number;
    o.pageId = 0;
    o.addItems = function (cb) {
        var self = this;
        ajaxPost(this.url, {
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

function OrderItems(url, number, fundingStatus, fundingType, orderStatus, payStatus, returnStatus) {
    var o = {};
    o.url = url;
    o.fundingStatus = fundingStatus;
    o.fundingType = fundingType;
    o.orderStatus = orderStatus;
    o.payStatus = payStatus;
    o.returnStatus = returnStatus;
    o.pageSize = number;
    o.pageId = 0;
    o.addItems = function (cb) {
        var self = this;
        ajaxPost(this.url, {
            fundingStatus: o.fundingStatus,
            orderStatus: o.orderStatus,
            payStatus: o.payStatus,
            returnStatus: o.returnStatus,
            fundingType: o.fundingType,
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

        if ($('#page-my-pre-order').length > 0) {
            $(document).ready(function () {
                var vm = new Vue({
                    el: '#page-my-pre-order',
                    data: {
                        count: 0,
                        fundingList: [],
                        funingImg: [],
                        pageId: 1
                    },
                    methods: {
                        goToDetail: goToDetail
                    }
                });

                function goToDetail (index) {
                    var funding = vm.fundingList[index];
                    if (funding.CrowdFunding.CrowdFundingType === 1 || funding.CrowdFunding.CrowdFundingType === 3) {
                        location.href = '/invest/invest-ongoing?id=' + funding.CrowdFunding.SysNo;
                    } else if (funding.CrowdFunding.CrowdFundingType === 2) {
                        location.href = '/product/product-ongoing?id=' + funding.CrowdFunding.SysNo;
                    } else {
                        return;
                    }
                }

                var foundingItem = new ReserveItems('/users/get-reserve', 5);
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = data.funding.slice();
                        vm.funingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $(window).scroll(function () {
                    var $this = $(this),
                        viewH = $(this).height(),//可见高度
                        contentH = $(this).get(0).scrollHeight,//内容高度
                        scrollTop = $(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if (scrollTop / (contentH - viewH) >= 0.95 && vm.fundingList < vm.count) { //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.fundingList = vm.fundingList.concat(data.funding);
                                vm.funingImg = vm.funingImg.concat(data.img);
                                vm.count = data.count;
                            }
                        });
                    }
                });

            });
            return;
        }

        if ($('#page-invest-list').length > 0) {
            $(document).ready(function () {
                var vm = new Vue({
                    el: '#page-invest-list',
                    data: {
                        count: 0,
                        fundingList: [],
                        funingImg: [],
                        pageId: 1
                    }
                });

                var foundingItem = new OrderItems('/users/get-order', 5, '[0,1,10,11]', '[1,3]', -1, -1, -1);
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = data.funding.slice();
                        vm.funingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $(window).scroll(function () {
                    var $this = $(this),
                        viewH = $(this).height(),//可见高度
                        contentH = $(this).get(0).scrollHeight,//内容高度
                        scrollTop = $(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if (scrollTop / (contentH - viewH) >= 0.95 && vm.fundingList < vm.count) { //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.fundingList = vm.fundingList.concat(data.funding);
                                vm.funingImg = vm.funingImg.concat(data.img);
                                vm.count = data.count;
                            }
                        });
                    }
                });
            });
            return;
        }
    });