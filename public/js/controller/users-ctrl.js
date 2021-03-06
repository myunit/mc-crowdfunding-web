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

function OrderItems(url, number, fundingStatus, fundingType, fundingActive, orderStatus, payStatus, returnStatus) {
    var o = {};
    o.url = url;
    o.fundingStatus = fundingStatus;
    o.fundingType = fundingType;
    o.fundingActive = fundingActive;
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
            fundingActive: o.fundingActive,
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
                        fundingImg: [],
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
                        vm.fundingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $(window).scroll(function () {
                    var $this = $(this),
                        viewH = $(this).height(),//可见高度
                        contentH = document.body.scrollHeight==0?document.documentElement.scrollHeight:document.body.scrollHeight,//内容高度
                        scrollTop = $(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if (scrollTop / (contentH - viewH) >= 0.99 && vm.fundingList.length < vm.count) { //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.fundingList = vm.fundingList.concat(data.funding);
                                vm.fundingImg = vm.fundingImg.concat(data.img);
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
                        payPhoto1: '',
                        payPhoto2: '',
                        payPhoto3: '',
                        payPhoto4: '',
                        payPhoto5: ''
                    },
                    methods: {
                        goToDetail: goToDetail,
                        cancelOrder: cancelOrder,
                        wantCancel: wantCancel,
                        wantPay: wantPay,
                        finishPay: finishPay,
                        goToProgress: goToProgress,
                        deletePhoto: deletePhoto
                    }
                });

                var foundingItem = new OrderItems('/users/get-order', 5, '[0,10,11]', '[1,3]', -1, -1, -1, -1);
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = data.funding.slice();
                        vm.fundingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $('[id^=payPhoto-]').change(function () {
                    var id_selector = $(this).attr("id");
                    var id = id_selector.substr(id_selector.length - 1);
                    id = parseInt(id);
                    if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
                        toastr.error('照片格式不正确,请选择png,jpeg,bmp格式照片上传', '错误');
                        return;
                    }

                    var fsize = this.files[0].size;
                    if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
                    {
                        toastr.error('照片大小不能超过5M', '错误');
                        return;
                    }

                    lrz(this.files[0], function (results) {
                        // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                        vm['payPhoto' + id] = results.base64;
                    });
                });

                function deletePhoto (index) {
                    vm['payPhoto' + index] = '';
                }

                function wantCancel (index) {
                    vm.curIndex = index;
                    $('#cancelModal').modal('show');
                }

                function wantPay (index) {
                    vm.curIndex = index;
                    vm.payPhoto1 = '';
                    vm.payPhoto2 = '';
                    vm.payPhoto3 = '';
                    vm.payPhoto4 = '';
                    vm.payPhoto5 = '';
                    $('#updatePayModal').modal('show');
                }

                function finishPay () {
                    if (!vm.payPhoto1 && !vm.payPhoto2 && !vm.payPhoto3 && !vm.payPhoto4 && !vm.payPhoto5) {
                        return;
                    }

                    $('#updatePayModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '提交中...'
                    });

                    var imgData = [];
                    for(var i = 1; i < 6; i++){
                        if (vm['payPhoto' + i]) {
                            var base = vm['payPhoto' + i].split(',');
                            imgData.push(base[1]);
                        }
                    }
                    ajaxPost('/users/finish-order', {orderId: funding.SysNo, imgData: JSON.stringify(imgData)}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            var obj = {
                                "orderId": funding.SysNo,
                                "pageId": 0,
                                "pageSize": 1,
                                "fundingStatus": -1,
                                "fundingType": -1,
                                "fundingActive": -1,
                                "orderStatus": -1,
                                "payStatus": -1,
                                "returnStatus": -1
                            };
                            ajaxPost('/users/get-order', obj, function (err, data) {
                                if (err) {
                                    toastr.error(err, '错误');
                                } else {
                                    if (data.count > 0) {
                                        vm.fundingList.splice(vm.curIndex, 1, data.funding[0]);
                                        vm.fundingImg.splice(vm.curIndex, 1, data.img[0]);
                                    }
                                }

                                vm.payPhoto1 = '';
                                vm.payPhoto2 = '';
                                vm.payPhoto3 = '';
                                vm.payPhoto4 = '';
                                vm.payPhoto5 = '';
                            });
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
                    var status ='';
                    var active = -1;
                    if (selectStatus === 1) {
                        active = 1;
                        status = '[0,10]';
                    } else if (selectStatus === 10) {
                        active = 10;
                        status = '[10]';
                    } else if (selectStatus === 11) {
                        active = 10;
                        status = '[11]'
                    } else {
                        active = -1;
                        status = '[0,10,11]'
                    }

                    var selectOrderStatus = parseInt($('#selectOrderStatus').children('option:selected').val());
                    var orderStatus = -1;
                    var payStatus = -1;
                    var returnStatus = -1;

                    if (selectOrderStatus === 0) {
                        orderStatus = 0;
                        payStatus = 0;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 1) {
                        orderStatus = 1;
                        payStatus = 0;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 2) {
                        orderStatus = 2;
                        payStatus = 1;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 3) {
                        orderStatus = 11;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 4) {
                        returnStatus = 1;
                    }

                    foundingItem = null;
                    foundingItem = new OrderItems('/users/get-order', 5, status, '[1,3]', active, orderStatus, payStatus, returnStatus);
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
                        contentH = document.body.scrollHeight==0?document.documentElement.scrollHeight:document.body.scrollHeight,//内容高度
                        scrollTop = $(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if (scrollTop / (contentH - viewH) >= 0.99 && vm.fundingList.length < vm.count) { //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.fundingList = vm.fundingList.concat(data.funding);
                                vm.fundingImg = vm.fundingImg.concat(data.img);
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
                        fundingImg: [],
                        pageId: 1,
                        curIndex: 0,
                        payPhoto1: '',
                        payPhoto2: '',
                        payPhoto3: '',
                        payPhoto4: '',
                        payPhoto5: ''
                    },
                    methods: {
                        goToDetail: goToDetail,
                        cancelOrder: cancelOrder,
                        wantCancel: wantCancel,
                        wantPay: wantPay,
                        finishPay: finishPay,
                        goToProgress: goToProgress,
                        deletePhoto: deletePhoto
                    }
                });

                $('[id^=payPhoto-]').change(function () {
                    var id_selector = $(this).attr("id");
                    var id = id_selector.substr(id_selector.length - 1);
                    id = parseInt(id);
                    if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(this.value)) {
                        toastr.error('照片格式不正确,请选择png,jpeg,bmp格式照片上传', '错误');
                        return;
                    }

                    var fsize = this.files[0].size;
                    if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
                    {
                        toastr.error('照片大小不能超过5M', '错误');
                        return;
                    }

                    lrz(this.files[0], function (results) {
                        // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                        vm['payPhoto' + id] = results.base64;
                    });
                });

                function deletePhoto (index) {
                    vm['payPhoto' + index] = '';
                }

                function wantCancel (index) {
                    vm.curIndex = index;
                    $('#cancelModal').modal('show');
                }

                function wantPay (index) {
                    vm.curIndex = index;
                    vm.payPhoto1 = '';
                    vm.payPhoto2 = '';
                    vm.payPhoto3 = '';
                    vm.payPhoto4 = '';
                    vm.payPhoto5 = '';
                    $('#updatePayModal').modal('show');
                }

                function finishPay () {
                    if (!vm.payPhoto1 && !vm.payPhoto2 && !vm.payPhoto3 && !vm.payPhoto4 && !vm.payPhoto5) {
                        return;
                    }
                    $('#updatePayModal').modal('hide');
                    var funding = vm.fundingList[vm.curIndex];
                    $('#opt-box-'+funding.SysNo).loading({
                        message: '提交中...'
                    });

                    var imgData = [];
                    for(var i = 1; i < 6; i++){
                        if (vm['payPhoto' + i]) {
                            var base = vm['payPhoto' + i].split(',');
                            imgData.push(base[1]);
                        }
                    }
                    ajaxPost('/users/finish-order', {orderId: funding.SysNo, imgData: JSON.stringify(imgData)}, function (err, data) {
                        $('#opt-box-'+funding.SysNo).loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            var obj = {
                                "orderId": funding.SysNo,
                                "pageId": 0,
                                "pageSize": 1,
                                "fundingStatus": -1,
                                "fundingType": -1,
                                "fundingActive": -1,
                                "orderStatus": -1,
                                "payStatus": -1,
                                "returnStatus": -1
                            };
                            ajaxPost('/users/get-order', obj, function (err, data) {
                                if (err) {
                                    toastr.error(err, '错误');
                                } else {
                                    if (data.count > 0) {
                                        vm.fundingList.splice(vm.curIndex, 1, data.funding[0]);
                                        vm.fundingImg.splice(vm.curIndex, 1, data.img[0]);
                                    }
                                }

                                vm.payPhoto1 = '';
                                vm.payPhoto2 = '';
                                vm.payPhoto3 = '';
                                vm.payPhoto4 = '';
                                vm.payPhoto5 = '';
                            });
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

                var foundingItem = new OrderItems('/users/get-order', 5, '[0,10,11]', '[2]', -1, -1, -1, -1);
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.fundingList = data.funding.slice();
                        vm.fundingImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                function changeSelect() {
                    var selectStatus = parseInt($('#selectStatus').children('option:selected').val());
                    var active = -1;
                    if (selectStatus === 1) {
                        active = 1;
                        status = '[0,10]';
                    } else if (selectStatus === 10) {
                        active = 10;
                        status = '[10]';
                    } else if (selectStatus === 11) {
                        active = 10;
                        status = '[11]'
                    } else {
                        active = -1;
                        status = '[0,10,11]'
                    }

                    var selectOrderStatus = parseInt($('#selectOrderStatus').children('option:selected').val());
                    var orderStatus = -1;
                    var payStatus = -1;
                    var returnStatus = -1;

                    if (selectOrderStatus === 0) {
                        orderStatus = 0;
                        payStatus = 0;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 1) {
                        orderStatus = 1;
                        payStatus = 0;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 2) {
                        orderStatus = 2;
                        payStatus = 1;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 3) {
                        orderStatus = 11;
                        returnStatus = 0;
                    } else if (selectOrderStatus === 4) {
                        returnStatus = 1;
                    }

                    foundingItem = null;
                    foundingItem = new OrderItems('/users/get-order', 5, status, '[2]', active, orderStatus, payStatus, returnStatus);
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
                        contentH = document.body.scrollHeight==0?document.documentElement.scrollHeight:document.body.scrollHeight,//内容高度
                        scrollTop = $(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if (scrollTop / (contentH - viewH) >= 0.99 && vm.fundingList.length < vm.count) { //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.fundingList = vm.fundingList.concat(data.funding);
                                vm.fundingImg = vm.fundingImg.concat(data.img);
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
                        fundingImg: [],
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
                        vm.fundingImg = vm.fundingImg.concat(data.img);
                        vm.count = data.count;
                        vm.fundingType = data.fundingType;

                        Vue.nextTick(function () {
                            $('.fancybox').fancybox();
                        });
                    }
                });
            });


        }
    });