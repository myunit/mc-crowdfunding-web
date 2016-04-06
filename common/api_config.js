/**
 * @author qianqing
 * @create by 16-4-6
 * @description
 */
var api_config = require('./api_config.json');

var ApiFactory = {
	CreateApi: function () {
		var api = api = new ApiService();
		return api;
	}
};

exports = module.exports = ApiFactory;

var ApiService = function () {
};

ApiService.prototype = {
	login: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.login;
	},
	sendCaptcha: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.sendCaptcha;
	},
	register: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.register;
	}
};