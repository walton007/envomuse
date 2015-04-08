var zmq = require("zmq"),
 socketCmd = zmq.socket("pull"),
 socketPub = zmq.socket("pub");
 
var scan = require('./scan');
var config = require('../config/env/all'); 

// Just a helper function for logging to the console with a timestamp.
function logToConsole (message) {  
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function broadMessage (action, msgObj) {  
    logToConsole("Sending: " + msgObj);
    socketPub.send([action, JSON.stringify(msgObj)]);
}

function ActionScan(taskId) {
	logToConsole('ActionScan');
	var msg = scan.scan();
	broadMessage('scan', {taskId: taskId, message: msg});
}

// Add a callback for the event that is invoked when we receive a message.
socketCmd.on("message", function (message) { 
	logToConsole(message);
	var cmdObj = JSON.parse(message); 
	if (cmdObj.cmd === 'scan') {
		ActionScan(cmdObj.taskId);
	};

});

 
// Begin listening for connections on all IP addresses on port 9998.
socketCmd.connect(config.pushCmdAddr);
socketPub.bindSync(config.pubAddr);