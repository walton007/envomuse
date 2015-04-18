'use strict';

console.log('zmqAgent start');

var zmq = require('zmq');  
var socketCmd = zmq.socket('push');
var socketSub = zmq.socket('sub');

var mean = require('meanio'),
  config = mean.loadConfig();

var gCmdDict = {};
var gCmdId = 1;

var ZmqAgent = function(pushCmdAddr, subConfig) {
	socketCmd.bindSync(config.pushCmdAddr); 

	//bind socketSub
	socketSub.connect(subConfig.addr);
	socketSub.subscribe(subConfig.subMsg);
	socketSub.on("message", function (topic, message) {  
		console.log('receive message:', topic, message);
		var recObj = JSON.parse(message.toString('utf8'));
		if (!!recObj.cmdId && recObj.cmdId in gCmdDict) {
			console.log('rev cmd resp: ', recObj.cmdId);
			var callback = gCmdDict[recObj.cmdId];
			delete gCmdDict[recObj.cmdId];
			callback(recObj.message);
		} else {
			console.log('rev resp with no cmdid', recObj);
		}
	});
};

ZmqAgent.prototype.sendCmd = function(cmd, args, callback) {
	// body...
	var cmdId = gCmdId;
	console.log('ZmqAgent sendCmd:', cmd, args, cmdId);

	gCmdDict[cmdId] = callback;
	gCmdId = 1+gCmdId;
	var msgStr = JSON.stringify({cmdId: cmdId, cmd: cmd, args: args});
	socketCmd.send(msgStr);
};

module.exports = exports = new ZmqAgent(config.pushCmdAddr, 
	{
		addr: config.pubAddr, 
		subMsg: 'cmd',
	});