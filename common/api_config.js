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
	},
	addFundingOrder: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.addFundingOrder;
	},
	addFundingReserve: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.addFundingReserve;
	},
	finishPayFunding: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.finishPayFunding;
	},
	getAllFunding: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getAllFunding;
	},
	getFundingOrder: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getFundingOrder;
	},
	getFundingProgress: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getFundingProgress;
	},
	getFundingReserve: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getFundingReserve;
	},
	getHotFunding: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getHotFunding;
	},
	getFundingDetail: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.getFundingDetail;
	},
	cancelFundingOrder: function () {
		return api_config.apiService.baseUrl + api_config.apiService.method.cancelFundingOrder;
	}
};