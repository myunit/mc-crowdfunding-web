/**
 * Created by WuYou on 2016/3/29.
 */
require.config({
    baseUrl: '../js',
    paths: {
        'Vue': './lib/vue.min'
    },
    shim: {
        'Vue': {
            exports: 'Vue'
        }
    }
});

require(['Vue'],
    function (Vue) {
        'use strict';
        Vue.config.delimiters = ['${', '}'];
        Vue.config.unsafeDelimiters = ['{!!', '!!}'];
        $(document).ready(function(){
            /*品牌详情进行中*/
            $("#invest-detail-ongoing").click(function () {
                location.href = '/invest/invest-ongoing';
            });
            /*品牌详情预热中*/
            $("#invest-detail-preheat").click(function () {
                location.href = '/invest/invest-preheat';
            });
            /*品牌详情成功*/
            $("#invest-detail-succeed").click(function () {
                location.href = '/invest/invest-success';
            });
            /*品牌详情失败*/
            $("#invest-detail-failed").click(function () {
                location.href = '/invest/invest-failed';
            });
            /*品牌详情预热中_预约成功*/
            $("#pre-order-invest").click(function () {
                location.href = '/invest/invest-failed';
            });
            $("#join-invest").click(function () {
                location.href = '/invest/invest-booking';
            });


        });

        $(document).ready(function(){
            var vm=new Vue({
                el:"#page-invest-booking",
                data:{
                    amount:'',
                    check_pro:''
                }
            });
            $("#submit-invest-booking").click(function(){

                if(!vm.amount){
                    var a = document.getElementById("invest-amount-label");
                    a.innerHTML = '<label style="font-size:14px;color:red;">请输入需要投资的份数</label>';
                    return;
                }

                if(!vm.check_pro){
                    var a = document.getElementById("check_pro-label");
                    a.innerHTML = '<label style="font-size:14px;color:red;">请阅读并同意协议</label>';
                    return;
                }
                location.href='/product/product-booking-pay';
            });
        });
    });