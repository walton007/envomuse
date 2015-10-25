
var util = require('util');

var async = require('async');

var request = require('request');

var request = request.defaults({jar: true, json: true, baseUrl: 'http://localhost:3000/'})

// #try to connect server
function login (callback) {
	console.log('> login');
	request.post({
		uri: '/login', 
		json: true,
		body: {"email":"walton008@qq.com","password":"Initial0"}
	}, function (err,httpResponse,body) {
		console.log('After login');
		callback(err);
	});
}

function createCustomer (callback) {
	console.log('> createCustomer');
	var customerData = {"brand":"KFC","companyName":"百胜集团","logo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABZUlEQVR4Xu3TQREAAAiEQK9/aWvsAxMw4O06ysAommCuINgTFKQgmAEMp4UUBDOA4bSQgmAGMJwWUhDMAIbTQgqCGcBwWkhBMAMYTgspCGYAw2khBcEMYDgtpCCYAQynhRQEM4DhtJCCYAYwnBZSEMwAhtNCCoIZwHBaSEEwAxhOCykIZgDDaSEFwQxgOC2kIJgBDKeFFAQzgOG0kIJgBjCcFlIQzACG00IKghnAcFpIQTADGE4LKQhmAMNpIQXBDGA4LaQgmAEMp4UUBDOA4bSQgmAGMJwWUhDMAIbTQgqCGcBwWkhBMAMYTgspCGYAw2khBcEMYDgtpCCYAQynhRQEM4DhtJCCYAYwnBZSEMwAhtNCCoIZwHBaSEEwAxhOCykIZgDDaSEFwQxgOC2kIJgBDKeFFAQzgOG0kIJgBjCcFlIQzACG00IKghnAcFpIQTADGE4LKQhmAMNpIQXBDGA4LQQL8oTPAGUY76lBAAAAAElFTkSuQmCC","industry":"餐饮","status":"prospect","updatePeriod":"每月更新","crmInfo":{"contractDate":null,"endContractDate":null}};
	request.post({
		uri: '/api/customers',
		body: customerData
	}, function (err, httpResponse, body) {
		console.log('After createCustomer', body);
		callback(err || body.error, body);
	});
}

function createSite (customer, callback) {
	console.log('> createSite');
	var uri = util.format('/api/customers/%s/sites', customer._id)
	var siteData = {"customerId":customer._id, "siteName":"KFC美罗城1","reference":"KFC-003", "manager":""};
	request.post({
		uri: uri,
		body: siteData
	}, function (err, httpResponse, body) {
		console.log('After createSite', body);
		callback(err || body.error, body);
	});
}

(function main () {
	async.waterfall([
	    login,
	    createCustomer,
	    createSite
	], function (err, result) {
		// console.log('main err:', err, result);
	    // result now equals 'done'
	    if (err) {
	    	console.log('error:', err);
	    } else {
	    	console.log('done');
	    }
	    
	})

}())




