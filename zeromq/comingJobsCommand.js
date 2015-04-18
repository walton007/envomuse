'use strict';

/**
 * Module dependencies.
 */
require('../packages/custom/envomuse/server/models/comingJob');

var mongoose = require('mongoose'),
fs = require('fs'),
Q = require('q'),
crypto = require('crypto'),
find = require('findit'),
path = require('path'),
chokidar = require('chokidar'),
_ = require('lodash'),
ComingJob = mongoose.model('ComingJob');
var DJUploadDir = path.resolve(__dirname, '../uploadAttachment/dj');

console.log('comingJob model path.normalize(p) :', DJUploadDir );

function allComingJobs (respCallback, respErrorback) {
	console.log('allComingJobs');
	// body...
	ComingJob.find({outdate: false})
	.exec(function(err, comingJobs) {
		if (err) {
			respErrorback && respErrorback('err:'+ err);
		} else {
			respCallback && respCallback(comingJobs);
		}
	});
}

function findByMd5(md5val, callback) {
	ComingJob.findOne({md5: md5val})
	.exec(callback);
}
function createComingJob(filepath, md5val, callback) {
	console.log('createComingJob');
	var comingJob = new ComingJob({
		filepath: filepath,
		md5: md5val,
		imported: false,
		outdate: false
	});
	comingJob.save(callback);
}
function validFilePath(filepath) {
	return path.extname(filepath) === '.mp3';
}

function forceRefresh(respCallback, respErrorback) {
	console.log('forceRefresh');
	var updateQ = Q.defer();
	ComingJob.update({}, { $set: { outdate: true }},
		function(err, numberAffected, raw) {
			updateQ.resolve();
		});

	Q.when(updateQ.promise)
	.then(function(){
		console.log('after updateQ');
		var hash_promises = [];
		var finder = find(DJUploadDir);
		finder.on('file', function (filepath, stat) {
			if (!validFilePath(filepath)) {
				return;
			}
			console.log('find file:', filepath);
			// console.log('find stat:', stat);
			var q = Q.defer();
			hash_promises.push(q.promise);
			var md5 = crypto.createHash('md5'),
			    fileStream = fs.ReadStream(filepath);
			fileStream.on('data', function(d) {
			  md5.update(d);
			});

			fileStream.on('end', function() {
				console.log('finish one file:', filepath);
				//find file with md5
				var md5value = md5.digest('hex');
				findByMd5(md5value, function(err, comingJob) {
					if (err) {
						console.error('findByMd5 error filepath:', filepath);
						q.reject('findByMd5 error filepath:'+ filepath);
						return;
					}
					if (!!comingJob) {
						console.log('already find one comingJob');
						comingJob.outdate = false;
						comingJob.filepath = filepath;
						comingJob.save(function(err, obj) {
							if (err) {
								q.reject('comingJob.save err:'+ err);
								return;
							};
							q.resolve(obj);
						});	
					} else {
						//create a new record
						createComingJob(filepath, md5value, 
							function(err, obj) {
								if (err) {
									q.reject('comingJob.create err:'+ err);
									return;
								};
								q.resolve(obj);
							});
					}
				});
			});
		});
		finder.on('end', function () {
			console.log('find end');
			Q.allSettled(hash_promises).spread(function() {
				var validComingJobs = [];
				var comingJobsArr = arguments;
				Object.keys(comingJobsArr).forEach(function(key) {
				  var objVal = comingJobsArr[key];
				  if (objVal.state === 'fulfilled') {
				  	validComingJobs.push(objVal.value);
				  }
				});
				console.log('validComingJobs:', validComingJobs);
				respCallback && respCallback(validComingJobs);
				// allComingJobs(respCallback, respErrorback);
			});
		});
		finder.on('error', function (err) {
			console.log('find err:', err);
			respErrorback && respErrorback('finder err'+err);
		});
	});
}

chokidar.watch(DJUploadDir, {
  ignored: /[\/\\]\./,
  persistent: true
}).on('all', function(event, path) {
	console.log('event', event);
	console.log('path', path);
	if (validFilePath(path)) {
		forceRefresh();
	};
});

exports = module.exports = {
	all: allComingJobs,
	forceRefresh: forceRefresh
};