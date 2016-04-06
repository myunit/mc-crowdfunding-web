/**
 * Created by WuYou on 2016/3/29.
 */
require.config({
    baseUrl: './js',
    paths: {
        'Vue': './lib/vue.min'
    },
    shim: {
        'Vue': {
            exports: 'Vue'
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


require(['Vue'],
    function (Vue) {
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

        /*登录*/
        $('#page-login').ready(function () {
            var vm = new Vue({
                el: '#page-login',
                data: {
                    username: '',
                    password: '',
                    captcha:'',
                    captchaTip: '获取验证码',
                    isSendCaptcha: false,
                    isDisable: true,
                    captchaMsg: ''
                }
            });

            $('#sendCaptcha').click(function (e) {
                e.preventDefault();
                var myreg=/^[1][358][0-9]{9}$/;
                if (vm.isSendCaptcha) {
                    return;
                }
                var a = document.getElementById("id-label");
                if (!vm.username) {
                    a.innerHTML = '<label style="font-size:14px;color:red;">11位手机号码</label>';
                    return;
                }

                if( !myreg.test(vm.username)){
                    a.innerHTML = '<label style="font-size:14px;color:red;">手机号码不正确</label>';
                    return;
                }

                ajaxPost('/send-captcha', {'phone': vm.username, 'type': 2}, function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        var time = 60;
                        vm.captchaTip = time + '秒';
                        vm.isSendCaptcha = true;
                        vm.isDisable = false;
                        vm.captchaMsg = '如果您未收到短信，请在60秒后再次获取';
                        var sendCaptchaInterval = setInterval(function () {
                            time--;
                            if (time > 9) {
                                vm.captchaTip = time + '秒';
                            } else {
                                vm.captchaTip = '0' + time + '秒';
                            }
                            if (time === 0) {
                                vm.captchaTip = '获取验证码';
                                vm.isSendCaptcha = false;
                                vm.isDisable = true;
                                vm.captchaMsg = '';
                                clearInterval(sendCaptchaInterval);
                            }
                        }, 1000);
                    }
                });
            });

            $("#login").click(function () {
                var myreg=/^[1][358][0-9]{9}$/;
                var a = null;
                if (!vm.username ) {
                    a = document.getElementById("id-label");
                    a.innerHTML = '<label style="font-size:14px;color:red;">11位手机号码</label>';
                    return;
                }

                if(!myreg.test(vm.username)){
                    a = document.getElementById("id-label");
                    a.innerHTML = '<label style="font-size:14px;color:red;">手机号码不正确</label>';
                    return;
                }

                if (!vm.captcha) {
                    a=document.getElementById("captcha-label");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入验证码</label>';
                    return;
                }

                if (!vm.password) {
                    a=document.getElementById("pass-label");
                    a.innerHTML='<label style="font-size:14px;color:red;">密码不能为空</label>';
                    return;
                }

                ajaxPost('/login', {'phone': vm.username, 'password': vm.password, 'captcha':vm.captcha}, function (err, data) {
                    if (err) {
                        toastr.error(err, '错误');
                    } else {
                        location.href = '/login-suc';
                    }
                });
            });
        });
        /*注册*/
        $(document).ready(function () {
            var vm = new Vue({
                el: '#page-reg-start',
                data: {
                    phone: '',
                    wechat:'',
                    password: '',
                    repassword:'',
                    validate:'',
                    captcha:'',
                    captchaTip: '获取激活码',
                    isSendCaptcha: false,
                    isDisable: true,
                    captchaMsg: ''
                }
            });
            $('#sendActiveCode').click(function () {
                var myreg=/^[1][358][0-9]{9}$/;
                if (vm.isSendCaptcha) {
                    return;
                }
                if(!vm.phone){
                    var a=document.getElementById("phone");
                    a.innerHTML='<label style="font-size:14px;color:red;">11位手机号码</label>';
                    return;
                }
                if(!myreg.test(vm.phone)){
                    var a=document.getElementById("phone");
                    a.innerHTML='<label style="font-size:14px;color:red;">手机号码不正确</label>';
                    return;
                }

                var time = 60;
                vm.captchaTip = time + '秒';
                vm.isSendCaptcha = true;
                vm.isDisable = false;
                vm.captchaMsg = '如果您未收到短信，请在60秒后再次获取';
                var sendCaptchaInterval = setInterval(function () {
                    time--;
                    if (time > 9) {
                        vm.captchaTip = time + '秒';
                    } else {
                        vm.captchaTip = '0' + time + '秒';
                    }
                    if (time === 0) {
                        vm.captchaTip = '获取激活码';
                        vm.isSendCaptcha = false;
                        vm.isDisable = true;
                        vm.captchaMsg = '';
                        clearInterval(sendCaptchaInterval);
                    }
                }, 1000);
            });

            $("#reg-start-next").click(function(){
                var myreg=/^[1][358][0-9]{9}$/;
                if(!vm.phone){
                    var a=document.getElementById("phone");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入电话号码</label>';
                    return;
                }
                if(!myreg.test(vm.phone)){
                    var a=document.getElementById("phone");
                    a.innerHTML='<label style="font-size:14px;color:red;">电话号码不正确</label>';
                    return;
                }
                if(!vm.wechat){
                    var a=document.getElementById("wechat");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入微信号</label>';
                    return;
                }
                if(!vm.password ||(vm.password && (vm.password.length<6 || vm.password.length>15))){
                    var a=document.getElementById("password");
                    a.innerHTML='<label style="font-size:14px;color:red;">6-15位密码</label>';
                    return;
                }

                if(!vm.repassword){
                    var a=document.getElementById("repassword");
                    a.innerHTML='<label style="font-size:14px;color:red;">请确认密码</label>';
                    return;
                }

                if(vm.password!=vm.repassword){
                    var a=document.getElementById("repassword");
                    a.innerHTML='<label style="font-size:14px;color:red;">密码输入不一致</label>';
                    return;
                }

                if(!vm.validate){
                    var a=document.getElementById("validate");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入验证码</label>';
                    return;
                }
                if(!vm.captcha){
                    var a=document.getElementById("captcha");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入激活码</label>';
                    return;
                }
                location.href = '/reg-info';
            });

        });

        /*注册-基本信息*/
        $(document).ready(function () {
            var vm_info = new Vue({
                el: '#page-reg-info',
                data: {
                    name: '',
                    id:'',
                    email: '',
                    address:''
                }
            });
            $("#reg-info-next").click(function(){
                /*邮箱*/
                var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

                /*15位身份证号*/
                var isIDCard1=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;

               /*18位身份证号*/
                var isIDCard2=/^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3})(\d|X)?$/;
                if(!vm_info.name){
                    var a=document.getElementById("name");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入真实姓名</label>';
                    return;
                }
                if(!vm_info.id){
                    var a=document.getElementById("id");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入身份证号</label>';
                    return;
                }

                if(vm_info.id && (!isIDCard1.test(vm_info.id) && !isIDCard2.test(vm_info.id))){
                    var a=document.getElementById("id");
                    a.innerHTML='<label style="font-size:14px;color:red;">身份证号不正确</label>';
                    return;
                }
                if(vm_info.email && !myreg.test(vm_info.email)){
                    var a=document.getElementById("email");
                    a.innerHTML='<label style="font-size:14px;color:red;">邮箱格式不正确</label>';
                    return;
                }
                if(!vm_info.address){
                    var a=document.getElementById("address");
                    a.innerHTML='<label style="font-size:14px;color:red;">请输入详细地址</label>';
                    return;
                }
                location.href = '/reg-platform';
            });

            /*实体店验证*/
            $("#submit-reg-realshop").click(function () {
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    //get the file size and file type from file input field
                    if ($('#licence')[0].files[0]) {
                        if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("licence").value)) {
                            var a = document.getElementById("licence-alert");
                            var b = document.getElementById("shop-name");
                            a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片格式不正确,请选择png,jpeg,bmp格式照片上传</label>';
                            b.focus();
                            return;
                        } else {
                            var fsize = $('#licence')[0].files[0].size;
                            if (fsize > 5242880) //do something if file size more than 1 mb (1048576)
                            {
                                var a = document.getElementById("licence-alert");
                                var b = document.getElementById("shop-name");
                                a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　照片大小不能超过5M</label>';
                                b.focus();
                                return;
                            }
                        }
                    }
                }
                location.href = '/reg-success';
            });

           /* 网店验证*/
            $("#submit-reg-shop").click(function(){

                location.href = '/reg-success';
            });

            /*平台采购验证*/
            $("#submit-reg-purchase").click(function(){
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    //get the file size and file type from file input field
                    if ($('#work-pic')[0].files[0]) {
                        if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("work-pic").value)) {
                            var a = document.getElementById("work-pic-alert");
                            var b = document.getElementById("platform-name");
                            a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　请选择png,jpeg,bmp格式照片上传</label>';
                            b.focus();
                            return;
                        }
                    }
                }
                location.href = '/reg-success';
            });

           /*微商验证*/
            $("#submit-reg-weiChat").click(function(){

                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    //get the file size and file type from file input field
                    if ($('#picture')[0].files[0]) {
                        if (!/\.(jpg|jpeg|png|bmp|JPG|PNG|BMP|JPEG)$/.test(document.getElementById("picture").value)) {
                            var a = document.getElementById("picture-alert");
                            var b = document.getElementById("weiChat-id");
                            a.innerHTML = '<label style="font-size:14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;　　　请选择png,jpeg,bmp格式照片上传</label>';
                            b.focus();
                            return;
                        }
                    }
                }
                location.href = '/reg-success';
            });
        });
    });