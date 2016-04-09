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
                        fundingImg: [],
                        pageId: 1,
                        curIndex: 0,
                        payPhoto: null
                    },
                    methods: {
                        goToDetail: goToDetail,
                        cancelOrder: cancelOrder,
                        wantCancel: wantCancel,
                        wantPay: wantPay,
                        finishPay: finishPay,
                        goToProgress: goToProgress
                    }
                });

                var foundingItem = new OrderItems('/users/get-order', 5, '[1,10,11]', '[1,3]', -1, -1, -1);
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = data.funding.slice();
                        vm.fundingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $('#payPhoto').change(function () {
                    var a = document.getElementById("picture-alert");
                    if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
                        a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
                        return;
                    }

                    var fsize = this.files[0].size;
                    if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
                    {
                        a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
                        return;
                    }

                    lrz(this.files[0], function (results) {
                        // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                        var base = results.base64.split(',');
                        vm.payPhoto = base[1];
                    });
                });

                function wantCancel (index) {
                    vm.curIndex = index;
                    $('#cancelModal').modal('show');
                }

                function wantPay (index) {
                    vm.curIndex = index;
                    $('#updatePayModal').modal('show');
                }

                function finishPay () {
                    $('#updatePayModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '提交中中...'
                    });
                    ajaxPost('/users/finish-order', {orderId: funding.SysNo, imgData: vm.payPhoto}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            funding.StatusTip = '审核中';
                            funding.OrderStatus = 1;
                            funding.PaymentStatus = 0;
                        }
                    });
                }

                function cancelOrder () {
                    $('#cancelModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '取消中...'
                    });
                    ajaxPost('/users/cancel-order', {orderId: funding.SysNo}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            funding.StatusTip = '已取消';
                            funding.OrderStatus = 11;
                            funding.ReturnStatus = 0;
                        }
                    });
                }

                function goToDetail (index) {
                    var funding = vm.fundingList[index];
                    location.href = '/invest/invest-ongoing?id=' + funding.CrowdFunding.SysNo;
                }

                function goToProgress (index) {
                    var funding = vm.fundingList[index];
                    location.href = '/users/my-process-view?id=' + funding.CrowdFunding.SysNo;
                }

                function changeSelect() {
                    var selectStatus = parseInt($('#selectStatus').children('option:selected').val());
                    if (selectStatus === 1) {
                        selectStatus = '[1]';
                    } else if (selectStatus === 10) {
                        selectStatus = '[10]';
                    } else if (selectStatus === 11) {
                        selectStatus = '[11]';
                    } else {
                        selectStatus = '[1,10,11]';
                    }

                    var selectOrderStatus = parseInt($('#selectOrderStatus').children('option:selected').val());
                    var orderStatus = -1;
                    var payStatus = -1;
                    var returnStatus = -1;

                    if (selectOrderStatus === 0) {
                        orderStatus = 0;
                        payStatus = 0;
                    } else if (selectOrderStatus === 1) {
                        orderStatus = 1;
                        payStatus = 0;
                    } else if (selectOrderStatus === 2) {
                        orderStatus = 1;
                        payStatus = 1;
                    } else if (selectOrderStatus === 3) {
                        orderStatus = 11;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 4) {
                        orderStatus = 11;
                        returnStatus = 1;
                    }

                    foundingItem = null;
                    foundingItem = new OrderItems('/users/get-order', 5, selectStatus, '[1,3]', orderStatus, payStatus, returnStatus);
                    vm.fundingList.splice(0, vm.fundingList.length);
                    vm.fundingImg.splice(0, vm.fundingImg.length);
                    foundingItem.addItems(function (err, data) {
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            vm.fundingList = data.funding.slice();
                            vm.fundingImg = data.img.slice();
                            vm.count = data.count;
                        }
                    });
                }

                $('#selectOrderStatus').change(function () {
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

        if ($('#page-product-list').length > 0) {
            $(document).ready(function () {
                var vm = new Vue({
                    el: '#page-product-list',
                    data: {
                        count: 0,
                        fundingList: [],
                        funingImg: [],
                        pageId: 1,
                        curIndex: 0,
                        payPhoto: null
                    },
                    methods: {
                        goToDetail: goToDetail,
                        cancelOrder: cancelOrder,
                        wantCancel: wantCancel,
                        wantPay: wantPay,
                        finishPay: finishPay,
                        goToProgress: goToProgress
                    }
                });

                $('#payPhoto').change(function () {
                    var a = document.getElementById("picture-alert");
                    if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
                        a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
                        return;
                    }

                    var fsize = this.files[0].size;
                    if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
                    {
                        a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
                        return;
                    }

                    lrz(this.files[0], function (results) {
                        // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                        var base = results.base64.split(',');
                        vm.payPhoto = base[1];
                    });
                });

                function wantCancel (index) {
                    vm.curIndex = index;
                    $('#cancelModal').modal('show');
                }

                function wantPay (index) {
                    vm.curIndex = index;
                    $('#updatePayModal').modal('show');
                }

                function finishPay () {
                    $('#updatePayModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '提交中中...'
                    });
                    ajaxPost('/users/finish-order', {orderId: funding.SysNo, imgData: vm.payPhoto}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            funding.StatusTip = '审核中';
                            funding.OrderStatus = 1;
                            funding.PaymentStatus = 0;
                        }
                    });
                }

                function cancelOrder () {
                    $('#cancelModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '取消中...'
                    });
                    ajaxPost('/users/cancel-order', {orderId: funding.SysNo}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            funding.StatusTip = '已取消';
                            funding.OrderStatus = 11;
                            funding.ReturnStatus = 0;
                        }
                    });
                }

                function goToDetail (index) {
                    var funding = vm.fundingList[index];
                    location.href = '/product/product-ongoing?id=' + funding.CrowdFunding.SysNo;
                }

                function goToProgress (index) {
                    var funding = vm.fundingList[index];
                    location.href = '/users/my-process-view?id=' + funding.CrowdFunding.SysNo;
                }

                var foundingItem = new OrderItems('/users/get-order', 5, '[0,1,10,11]', '[2]', -1, -1, -1);
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

        if ($('#page-progress-view').length > 0) {
            $(document).ready(function () {
                var search = Utils.getSearch(location);
                if (!search['id']) {
                    location.href = '/invest/invest-list';
                    return;
                }

                var vm = new Vue({
                    el: '#page-progress-view',
                    data: {
                        count: 0,
                        fundingList: [],
                        funingImg: [],
                        fundingType: 0
                    }
                });

                ajaxPost('/users/get-progress', {
                    fundingId: parseInt(search['id']),
                    pageId: 0,
                    pageSize: 200
                }, function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = vm.fundingList.concat(data.funding);
                        vm.funingImg = vm.funingImg.concat(data.img);
                        vm.count = data.count;
                        vm.fundingType = data.fundingType;
                    }
                });
            });


        }
    });