var zmq = require("zmq");  
var socketCmd = zmq.socket("push");
var socketSub = zmq.socket("sub");
var config = require('../config/env/all'); 

// Just a helper function for logging to the console with a timestamp.
function logToConsole (message) {  
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

// Connect to the server instance.
socketCmd.bindSync(config.pushCmdAddr); 
console.log('config.pubAddr:', config.pubAddr);
socketSub.connect(config.pubAddr);
socketSub.subscribe('cmd');
socketSub.on("message", function (topic, message) {  
	var recObj = JSON.parse(message.toString('utf8'));
	console.log('socketSub on message', topic.toString('utf8'), recObj);
    // Convert the message into a string and log to the console.
    // var recObj = JSON.parse(message);
    logToConsole("  cmdId: " + recObj.cmdId);
});

setTimeout(function() {
	console.log('going send msg');
	var msgStr = JSON.stringify({cmdId: 11, cmd: 'comingJobs', args:['all']});
	socketCmd.send(msgStr);

	var msgStr = JSON.stringify({cmdId: 13, cmd: 'comingJobs', args:['forceRefresh']});
	socketCmd.send(msgStr);
	 
}, 200);