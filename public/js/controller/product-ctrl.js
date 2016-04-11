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
                    location.href = '/product/product-ongoing?id=' + vm.productList[index].SysNo;
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
                    changeSelect ();
                });

                function changeSelect () {
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

                    foundingItem = null;
                    foundingItem = new FoundingItems('/invest/get-all-funding', 20, status, '[2]');
                    vm.productList.splice(0, vm.productList.length);
                    vm.productImg.splice(0, vm.productImg.length);
                    foundingItem.addItems(function (err, data) {
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            vm.productList = data.funding.slice();
                            vm.productImg = data.img.slice();
                            vm.count = data.count;
                        }
                    });
                }

                $('#selectStatus').change(function(){
                    changeSelect ();
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
            return;
        }

        if ($('#page-product-detail').length > 0 ) {
            $(document).ready(function () {
                var search = Utils.getSearch(location);
                if (!search['id']) {
                    location.href = '/product/product-list';
                    return;
                }
                var vm = new Vue({
                    el: '#page-product-detail',
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
                    location.href = '/product/product-booking?id=' + search['id'];
                }

                function reserve () {
                    ajaxPost('/product/add-funding-reserve', {fundingId: parseInt(search['id'])}, function (err, data) {
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
                    vm.swiperImg.splice(0, vm.swiperImg.length);
                    vm.swiperImg = vm.imgList[index].ImgValue.slice();
                }

                ajaxPost('/product/get-funding-detail', {fundingId: parseInt(search['id'])}, function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        if (data.count === 1) {
                            vm.funding = Utils.clone(data.funding);
                            vm.imgList = data.img.slice();
                            if (vm.imgList.length >= 8) {
                                var $video = $('.ui-video-content video');
                                $('source', $video).attr('src', vm.imgList[7].ImgValue.length > 0 ? vm.imgList[7].ImgValue[0]:'');
                                $video[0].load();
                            }

                            vm.swiperImg = vm.imgList[2].ImgValue.slice();
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

                                $('[id^=carousel-selector-]').click( function(){
                                    var id_selector = $(this).attr("id");
                                    var id = id_selector.substr(id_selector.length -1);
                                    id = parseInt(id);
                                    $('#my-carousel').carousel(id);
                                    $('[id^=carousel-selector-]').removeClass('selected');
                                    $(this).addClass('selected');
                                });

                                $('#my-carousel').on('slid', function (e) {
                                    var id = $('.item.active').data('slide-number');
                                    id = parseInt(id);
                                    $('[id^=carousel-selector-]').removeClass('selected');
                                    $('[id=carousel-selector-'+id+']').addClass('selected');
                                });
                            });
                        }
                    }
                });

            });

            return;
        }

        if ($('#page-product-booking').length > 0) {
            $(document).ready(function () {
                var search = Utils.getSearch(location);
                if (!search['id']) {
                    location.href = '/product/product-list';
                    return;
                }

                var vm = new Vue({
                    el: '#page-product-booking',
                    data: {
                        check_pro: false,
                        num: 1,
                        funding: null
                    },
                    computed: {
                        amount: function () {
                            return this.num * this.funding.UnitPrice;
                        }
                    },
                    methods: {
                        submitOrder: submitOrder
                    }
                });

                ajaxPost('/product/get-funding-detail', {fundingId: parseInt(search['id'])}, function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        if (data.count === 1) {
                            vm.funding = Utils.clone(data.funding);
                            vm.num = vm.funding.MinBuyQuantity;
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

                    if (vm.num < vm.funding.MinBuyQuantity) {
                        toastr.warning('该众筹起订数量为 ' + vm.funding.MinBuyQuantity);
                        return;
                    }

                    $('.my-booking-box').loading({
                        message: '提交订单...'
                    });
                    ajaxPost('/product/add-funding-order', {
                        fundingId: parseInt(search['id']),
                        "quantity": vm.num,
                        "price": vm.amount*100
                    }, function (err, data) {
                        $('.my-booking-box').loading('stop');
                        if (err) {
                            toastr.error(err, '错误');
                        } else {
                            location.href = '/product/product-booking-pay?p=' + encodeURI(encodeURI(vm.amount));
                        }
                    });
                }
            });

            return;
        }

        if ($('#page-product-pay').length > 0) {
            $(document).ready(function () {
                var search = Utils.getSearch(location);
                if (!search['p']) {
                    location.href = '/product/product-list';
                    return;
                }

                var vm = new Vue({
                    el: '#page-product-pay',
                    data: {
                        amount: decodeURI(search['p'])
                    },
                    methods: {
                        confirm: confirm
                    }
                });

                function confirm () {
                    location.href = '/product/product-booking-pay-confirm?p=' + search['p'];
                }
            });
            return;
        }

        if ($('#page-product-confirm').length > 0) {
            $(document).ready(function () {
                var search = Utils.getSearch(location);
                if (!search['p']) {
                    location.href = '/product/product-list';
                    return;
                }

                var vm = new Vue({
                    el: '#page-product-confirm',
                    data: {
                        amount: decodeURI(search['p'])
                    }
                });
            });
            return;
        }

    });