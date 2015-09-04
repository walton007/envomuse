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
	JSZip = require('jszip'),
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
			outdate: false
		})
		.select('-filepath -outdate -meta.dateTemplates -meta.tracksMeta')
		.exec(function(err, comingJobs) {
			if (err) {
				respErrorback && respErrorback('err:' + err);
			} else {
				respCallback && respCallback(comingJobs);
			}
		});
}

function getDetailInfo(comingJobId, respCallback, respErrorback) {
	ComingJob.find({
		_id: comingJobId
	})
	.select('-filepath -outdate')
	.exec(function(err, comingJob) {
		if (err) {
			respErrorback && respErrorback('err:' + err);
		} else {
			respCallback && respCallback(comingJob);
		}
	});
}

function ComingJobsStatistic(respCallback, respErrorback) {
	console.log('ComingJobsStatistic');
	// body...

	ComingJob.aggregate([{
    $match: {
      outdate: false
    }
  }, {
    $group: {
      _id: '$importStatus',
      count: {$sum: 1}
    }
  }])
  .exec(function(err, result) {
    console.log('result:', result);
    if (err) {
      respErrorback && respErrorback('err:' + err);
      return;
    };
    var statusMap = {};
    _.each(result, function(obj) {
      statusMap[obj._id] = obj.count;
    });

    respCallback && respCallback(statusMap);
  });
}

function findByMd5(hash, callback) {
	ComingJob.findOne({
			hash: hash
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
			hash: hash,
			outdate: false
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
		return;
	}
	isRefreshing = true;

	console.log('forceRefresh');
	var updateQ = Q.defer();
	ComingJob.update({importStatus: 'notImport'}, {
			$set: {
				outdate: true
			}
		},
		function(err, numberAffected, raw) {
			updateQ.resolve();
		});

	Q.when(updateQ.promise)
		.then(function() {
			console.log('after updateQ');
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
					console.log('md5value hash:', hash);
					findByMd5(hash, function(err, comingJob) {
						if (err) {
							console.error('findByMd5 error filepath:', filepath);
							q.reject('findByMd5 error filepath:' + filepath);
							return;
						}
						if (!!comingJob) {
							console.log('already find one comingJob');
							comingJob.outdate = false;
							comingJob.filepath = filepath;
							comingJob.save(function(err, obj) {
								if (err) {
									q.reject('comingJob.save err:' + err);
									return;
								};
								q.resolve(obj);
							});
						} else {
							//create a new record
							createComingJob(filepath, hash,
								function(err, obj) {
									if (err) {
										q.reject('comingJob.create err:' + err);
										return;
									};
									q.resolve(obj);
								});
						}
					});
				});
			});
			finder.on('end', function() {
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
					isRefreshing = false;
				});
			});
			finder.on('error', function(err) {
				console.log('find err:', err);
				respErrorback && respErrorback('finder err' + err);
				isRefreshing = false;
			});
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
			if (comingJob.importStatus !== 'importing') {
				console.error('failed to find that comingJob');
				task.failed();
				return;
			};
			// Create Job and song according to comingJob
			zipManager.extractData(comingJob, musicAssertDir,
				function(err, newJob) {
					if (err) {
						console.error('failed to extraData comingJob');
						comingJob.badzip();
						task.failed();
						return
					};
					console.log('finish task');
					comingJob.finish();
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
				status: 'idle'
			}
		},
		function(err, numberAffected, raw) {
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
				callback(err, task);
				return;
			};

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
			
			comingJob.doImporting(function(err, obj) {
				if (err) {
					console.error('save comingJob err', err);
					respErrorback('save comingJob err');
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
			})

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
	statistic: ComingJobsStatistic,
	forceRefresh: forceRefresh,
	doImport: importComingJob,

	//tasks
	allTasks: allTasks,

	//reset!!
	reset: clearAll
};