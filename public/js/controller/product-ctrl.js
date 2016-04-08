/**
 * Created by WuYou on 2016/3/30.
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

        if ($('#page-product-list').length > 0 ) {
            $(document).ready(function () {
                var vm = new Vue({
                    el: '#page-product-list',
                    data: {
                        count: 0,
                        productList: [],
                        productImg: []
                    },
                    methods: {
                        goToDetail: goToDetail
                    }
                });

                function goToDetail(index) {
                    location.href = '/invest/product-ongoing?id=' + vm.productList[index].SysNo;
                }

                var foundingItem = new FoundingItems('/invest/get-all-funding', 20, '[0,1,10,11]' , '[2]');
                foundingItem.addItems(function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        vm.productList = data.funding.slice();
                        vm.productImg = data.img.slice();
                        vm.count = data.count;
                    }
                });

                $('#selectSource').change(function(){

                });

                $('#selectStatus').change(function(){
                    var val = parseInt($(this).children('option:selected').val());
                    var status = '';
                    if (val === 0) {
                        status = '[0]';
                    } else if (val === 1) {
                        status = '[1]';
                    } else if (val === 2) {
                        status = '[10,11]';
                    } else {
                        status = '[0,1,10,11]';
                    }
                    foundingItem = null;
                    foundingItem = new FoundingItems('/invest/get-all-funding', 20, status, '[2]');
                    vm.productList.splice(0, vm.productList.length);
                    vm.proudctImg.splice(0, vm.proudctImg.length);
                    foundingItem.addItems(function (err, data) {
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            vm.productList = data.funding.slice();
                            vm.proudctImg = data.img.slice();
                            vm.count = data.count;
                        }
                    });
                });


                $(window).scroll(function(){
                    var $this =$(this),
                        viewH =$(this).height(),//可见高度
                        contentH =$(this).get(0).scrollHeight,//内容高度
                        scrollTop =$(this).scrollTop();//滚动高度
                    //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
                    if(scrollTop/(contentH -viewH)>=0.95 && vm.equityList < vm.count){ //到达底部100px时,加载新内容
                        foundingItem.addItems(function (err, data) {
                            if (err) {
                                toastr.error(err, '错误');
                            } else {
                                vm.productList = vm.productList.concat(data.funding);
                                vm.productImg = vm.productImg.concat(data.img);
                                vm.count = data.count;
                            }
                        });
                    }
                });
            });
        }

    });