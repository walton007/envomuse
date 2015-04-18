var zmq = require("zmq"),
 socketCmd = zmq.socket("pull"),
 socketPub = zmq.socket("pub");

// var config = require('../config/env/all'); 
var mean = require('meanio'),
  config = mean.loadConfig();

var CMD = 'cmd';
// Just a helper function for logging to the console with a timestamp.
function logToConsole (message) {  
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function broadMessage (action, msgObj) {  
    logToConsole("Sending: action:"+action+ ' msgObj.cmdId:' + msgObj.cmdId);
    socketPub.send([action, JSON.stringify(msgObj)]);
}

function errHandling(cmdObj, errMsg) {
	broadMessage(CMD, {cmdId: cmdObj.cmdId, error: errMsg});
}


var CmdModules = {
	'comingJobs': require('./comingJobsCommand')
};



// Add a callback for the event that is invoked when we receive a message.
socketCmd.on("message", function (message) { 
	logToConsole(message);
	 
	var cmdObj = JSON.parse(message); 
	if (cmdObj.cmd in CmdModules) {
		var handlerMgr = CmdModules[cmdObj.cmd];
		if (cmdObj.args && cmdObj.args.length > 0) {
			var method = cmdObj.args.splice(0, 1);
			if (method in handlerMgr && typeof handlerMgr[method] === 'function') {
				handlerMgr[method].apply(null,
				 cmdObj.args.concat([function(message){
					broadMessage(CMD, {cmdId: cmdObj.cmdId, message: message});
				}, function(errMsg) {
					errHandling(cmdObj, errMsg);
				}]));
			} else {
				errHandling(cmdObj, 'No Such Method');
			}
		};
	} else {
		errHandling(cmdObj, 'No Such Cmd Module');
	}
});

// Begin listening for connections on all IP addresses on port 9998.
socketCmd.connect(config.pushCmdAddr);
socketPub.bindSync(config.pubAddr);