'use strict';

/**
 * Module dependencies.
 */
require('../packages/custom/envomuse/server/models/comingJob');
require('../packages/custom/envomuse/server/models/task');
require('../packages/custom/envomuse/server/models/job');
require('../packages/custom/envomuse/server/models/track');

var mean = require('meanio'),
  config = mean.loadConfig();

var mongoose = require('mongoose'),
	fs = require('fs'),
	Q = require('q'),
	crypto = require('crypto'),
	find = require('findit'),
	path = require('path'),
	async = require('async'),
	chokidar = require('chokidar'),
	_ = require('lodash'),
	ComingJob = mongoose.model('ComingJob'),
	Job = mongoose.model('Job'),
	Track = mongoose.model('Track'),
	Task = mongoose.model('Task');

var zipManager = require('./zipmanager');
var DJUploadDir = config.DJUploadDir ? config.DJUploadDir :path.resolve(__dirname, '../uploadAttachment/dj');
var musicAssertDir = path.resolve(__dirname, '../'+ config.musicAssert);
console.log('comingJob model path.normalize(p) :', DJUploadDir);

if (!fs.existsSync(musicAssertDir)) {
 fs.mkdirSync(musicAssertDir);
}

var ERROR = {
	TASK_RUNNING_FAILED: 0
};

function clearAll(respCallback, respErrorback) {
	console.log('!! Clear All Song, Job, Task and ComingJob records!!');
	Job.remove({}).exec();
	Track.remove({}).exec();
	ComingJob.remove({}).exec();
	Task.remove({}).exec();
	respCallback && respCallback('Done');
}

function allComingJobs(respCallback, respErrorback) {
	console.log('allComingJobs');
	// body...
	ComingJob.find({
			invalid: false
		})
		.select('-filepath -invalid -meta.dateTemplates -meta.tracksMeta')
		.exec(function(err, comingJobs) {
			if (err) {
				respErrorback && respErrorback('err:' + err);
			} else {
				var comingJobIds = _.pluck(comingJobs, '_id');
				//Tasks. {status, description}
				Task.find({ "ref" : { $in: comingJobIds } })
				.exec(function (err, tasks) {
					console.log('tasks:', tasks);
					if (err) {
						return respErrorback && respErrorback('err2:' + err);
					}

					var comingJobTaskDict = {};
					_.each(tasks, function(task) {
						comingJobTaskDict[task.ref] = task;
					});

					var retComingJobs = [];
					_.each(comingJobs, function(comingJob) {
						var oneIncomingJob = comingJob.toJSON();
						oneIncomingJob.task = comingJobTaskDict[oneIncomingJob._id] ? comingJobTaskDict[oneIncomingJob._id] : null;
						retComingJobs.push(oneIncomingJob);
					});

					respCallback && respCallback(retComingJobs);
				});

				
			}
		});

}

function getDetailInfo(comingJobId, respCallback, respErrorback) {
	ComingJob.find({
		_id: comingJobId
	})
	.select('-filepath -invalid')
	.exec(function(err, comingJob) {
		if (err) {
			respErrorback && respErrorback('err:' + err);
		} else {
			respCallback && respCallback(comingJob);
		}
	});
}

// function ComingJobsStatistic(respCallback, respErrorback) {
// 	console.log('ComingJobsStatistic');
// 	// body...

// 	ComingJob.aggregate([{
//     $match: {
//       invalid: false
//     }
//   }, {
//     $group: {
//       _id: '$importStatus',
//       count: {$sum: 1}
//     }
//   }])
//   .exec(function(err, result) {
//     console.log('result:', result);
//     if (err) {
//       respErrorback && respErrorback('err:' + err);
//       return;
//     };
//     var statusMap = {};
//     _.each(result, function(obj) {
//       statusMap[obj._id] = obj.count;
//     });

//     respCallback && respCallback(statusMap);
//   });
// }

function findByMd5(hash, callback) {
	ComingJob.findOne({
			hash: hash,
			invalid: false
		})
		.exec(callback);
}

function createComingJob(filepath, hash, callback) {
	console.log('createComingJob filepath:', filepath);
	zipManager.getMetaInfo(filepath, function(err, meta) {
		if (err) {
			console.error('failed to getMetaInfo:', filepath);
			callback(err);
			return;
		}

		var target = {
			meta: meta,
			filepath: filepath,
			hash: hash
		};
		// console.log('target:', target);
		var comingJob = new ComingJob(target);
		comingJob.save(callback);
	});
}

function validFilePath(filepath) {
	return path.extname(filepath) === '.zip';
}

var isRefreshing = false;

function forceRefresh(respCallback, respErrorback) {
	if (isRefreshing) {
		return respErrorback && respErrorback('working');
	}
	isRefreshing = true;

	// 1. prepare dict  =
	// 2. scan all comingJobs db record to update info
    //    a. if imported (which means have task reference), then remove related item in zipInfoDict
    //    b. if not imported, find it in zipInfoDict
    //       - got it, then update filepath, remove related item in zipInfoDict
    //       - not find it, mark this record as invalid
    // 3. scan zipInfoDict, then add a new record in comingJobs   
    var zipInfoDict = {};
    async.waterfall([
    	function(next) {
    		// prepare zipInfoDict
    		console.log('-- prepare zipInfoDict');
			var hash_promises = [];
			var finder = find(DJUploadDir);
			finder.on('file', function(filepath, stat) {
				if (!validFilePath(filepath)) {
					console.log('Not zip file for file:', filepath);
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
					var hash = md5.digest('hex');
					q.resolve();
					zipInfoDict[hash] = filepath;
					console.log('md5value hash:', hash);
				});
			});
			finder.on('end', function() {
				console.log('find end');
				Q.allSettled(hash_promises).spread(function() {
					next(null);
				});
			});
			finder.on('error', function(err) {
				console.log('find err:', err);
				next(err);
			});
		},

		function (next) {
			// scan all comingJobs db record to update info
			console.log('-- scan all comingJobs db record to update info');
			ComingJob.find({invalid: false},
				function (error, comingJobs) {
					if (error) {
						return next(error);
					}
					
					async.each(comingJobs
						, function(comingJob, callback) {
							Task.findOne({
								type: 'comingJob',
								ref: comingJobs._id
							}, function (err, task) {
								if (err) {
									next(err); 
									return;
								}
								if (task) {
									// a. if imported (which means have task reference), then remove related item in zipInfoDict
									delete zipInfoDict[comingJob.hash];
								} else {
									// b. if not imported, find it in zipInfoDict
									if (comingJob.hash in zipInfoDict) {
										// - got it, then update filepath;remove related item in zipInfoDict
										comingJob.filepath = zipInfoDict[comingJob.hash];
										delete zipInfoDict[comingJob.hash];
									} else {
										// - not find it, mark this record as invalid
										comingJob.invalid = true;
									}
									comingJob.save(callback);
								}

							});
						}
						, next);
				});

		},

		function (next) {
			// scan zipInfoDict, then add a new record in comingJobs
			console.log('-- scan zipInfoDict, then add a new record in comingJobs');
			async.forEachOf(zipInfoDict
				, function (filepath, hash, callback) {
					createComingJob(filepath, hash, callback);
				},
				next);
		}],

		function (err) {
			console.log('-- forceRefresh Done');
			isRefreshing = false;
			if (err) {
				respErrorback && respErrorback(err);
				return console.error('forceRefresh error: ', err);
			}
			allComingJobs(respCallback, respErrorback);
		});
}

function extractingComingJob(task) {
	console.log('extractingComingJob');
	ComingJob.findOne({
			_id: task.ref
		})
		.exec(function(err, comingJob) {
			if (err || !comingJob) {
				console.error('failed to find that comingJob');
				task.failed();
				return;
			};

			// Create Job and song according to comingJob
			zipManager.extractData(comingJob, musicAssertDir,
				function(err, newJob) {
					if (err) {
						console.error('failed to extraData comingJob');
						task.failed();
						return
					};
					console.log('finish task');
					task.finish();
				});

		});
}

function StartIdleTasks() {
	Task.find({
			status: 'idle'
		})
		.exec(function(err, tasks) {
			if (err) {
				console.error('find task err', err);
				return;
			};
			if (tasks.length) {
				var oneTask = tasks[0];
				oneTask.status = 'running';
				oneTask.save();
				if (oneTask.type === 'comingJob') {
					console.log('extracting comingJob to job and music');
					extractingComingJob(oneTask);
				}
			};


		});
	// entrants.find({pincode: {'$ne': null }})
}

function ClearRuningTask(callback) {
	Task.update({
			status: 'running'
		}, {
			$set: {
				status: 'failed',
				description: 'Clear all running task to failed',
				errorCode: ERROR.TASK_RUNNING_FAILED
			}
		},
		function(err, numberAffected) {
			callback();
		});
}

function CreateTask(type, ref, callback) {
	Task.findOne({
			type: type,
			ref: ref
		})
		.exec(function(err, task) {
			console.log('err task', err, task);
			if (err) {
				callback(err);
				return;
			}
			if (task) {
				if (task.status === 'failed') {
					// reset failed to idle, and record the old failed reason
					console.log('reset failed task to idle', task);
					task.status = 'idle';
					if (!task.historyErrorRecordArr instanceof Array) {
						task.historyErrorRecordArr = [];
					}
					task.historyErrorRecordArr.push({description: task.description, errorCode: task.errorCode});
					return task.save(callback);
				};
				return callback(null, task);
			}

			var task = new Task({
				type: type,
				ref: ref
			});
			task.save(callback);
		});
}

function allTasks(respCallback, respErrorback) {
	Task.find({}).exec(function(err, tasks) {
		if (err) {
			console.error('get tasks error:', err);
			respErrorback(err);
			return;
		};
		respCallback(tasks);
	})
}

function importComingJob(comingJobId, respCallback, respErrorback) {
	console.log('importComingJob comingJobId:', comingJobId);
	// respCallback(111);
	ComingJob.findOne({
			_id: comingJobId
		})
		.exec(function(err, comingJob) {
			if (err) {
				console.error('importComingJob err', err);
				_.isFunction(respErrorback) && respErrorback(err);
				return;
			};
			if (!comingJob) {
				console.error('no such comingJob');
				_.isFunction(respErrorback) && respErrorback('no such comingJob');
				return;
			};
			
			//start an task record
			CreateTask('comingJob', comingJob.id, function(err, task) {
				if (err) {
					console.error('CreateTask err', err);
					respErrorback('CreateTask err');
					return;
				};
				respCallback(task.id);
			});

		});
}

// chokidar.watch(DJUploadDir, {
// 	ignored: /[\/\\]\./,
// 	persistent: true
// }).on('all', function(event, path) {
// 	// console.log('event', event);
// 	// console.log('path', path);
// 	if (validFilePath(path)) {
// 		forceRefresh();
// 	};
// });

ClearRuningTask(function() {
	setInterval(StartIdleTasks, 10000);
});

//For Development Usage
// clearAll();

exports = module.exports = {
	all: allComingJobs,
	detail: getDetailInfo,
	// statistic: ComingJobsStatistic,
	forceRefresh: forceRefresh,
	doImport: importComingJob,

	//tasks
	allTasks: allTasks,

	//reset!!
	reset: clearAll
};