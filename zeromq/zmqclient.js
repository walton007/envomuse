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
socketSub.connect(config.pubAddr);
socketSub.subscribe('scan');
socketSub.on("message", function (topic, message) {  
	var recObj = JSON.parse(message.toString('utf8'));
	console.log('socketSub on message', topic.toString('utf8'), recObj);
    // Convert the message into a string and log to the console.
    // var recObj = JSON.parse(message);
    logToConsole("  message: " + recObj.message[0].meta);
    logToConsole("  taskId: " + recObj.taskId);
});

setTimeout(function() {
	console.log('going send msg');
	var msgStr = JSON.stringify({taskId: 11, cmd: 'scan'});
	socketCmd.send(msgStr);
	 
}, 200);