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
            /*去支持*/
            $("#detail-to-join").click(function () {
                location.href = '/invest/invest-ongoing';
            });
            /*查看项目进度*/
            $("#view-invest-process").click(function () {
                location.href = '../users/my-process-view';
            });
        });
    });