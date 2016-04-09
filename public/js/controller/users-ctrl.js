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

                function getReserve (pageId) {
                    ajaxPost('/users/get-reserve', {pageId: pageId, pageSize: 5}, function (err, data) {
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            vm.fundingList.splice(0, vm.fundingList.length);
                            vm.funingImg.splice(0, vm.funingImg.length);
                            vm.fundingList = data.funding.slice();
                            vm.funingImg = data.img.slice();
                            vm.count = data.count;
                        }
                    });
                }

                getReserve(vm.pageId - 1);

            });
            return;
        }
    });