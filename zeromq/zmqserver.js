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

console.log('Server running Process PID: ', process.pid);

function test() {
	var fs = require('fs');
	var yauzl = require("yauzl");
var zipFilepath = '/Users/i071628/meanStack/github/envomuse/uploadAttachment/dj/wanlai.zip';
	
	yauzl.open(zipFilepath, function(err, zipfile) {
  if (err) throw err;
  zipfile.on("entry", function(entry) {
  	
    if (/\/$/.test(entry.fileName)) {
      // directory file names end with '/' 
      return;
    }

    if (entry.fileName.substr(0, 6) !== 'asset/') {
    	return;
    }

    console.log('entry.fileName:', entry.fileName.substr(6));

    if (false && entry.fileName === 'musicEditor.json') {
    	zipfile.openReadStream(entry, function(err, readStream) {
	      if (err) throw err;
	      // ensure parent directory exists, and then: 
	      // readStream.pipe(fs.createWriteStream(entry.fileName));
	      // var metadata = '';
	      var bufferArr = [];
	      // readStream.setEncoding('utf8');
	      readStream.on('data', function (data) {
	      	bufferArr.push(data);
	      	console.log('data:', data.length);
	      	// metadata = metadata+data;
	      });
	      readStream.on('end', function ( ) {
	      	var buf = Buffer.concat(bufferArr);
	      	var last = JSON.parse(buf);
	      	console.log('JSONdata:', typeof last, last.name);
	      });
	    });
    }
    
  });
});
}
// test();