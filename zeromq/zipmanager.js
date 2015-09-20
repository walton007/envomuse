require('../packages/custom/envomuse/server/models/track');

var async = require("async"),
    yauzl = require("yauzl");
	path = require('path'),
	fs = require('fs'),
	Q = require('q'),
	crypto = require('crypto'),
	_ = require('lodash');
// var filepath = path.resolve(__dirname, '../uploadAttachment/dj/Archive.zip');



var mongoose = require('mongoose'),
	Job = mongoose.model('Job'),
	Track = mongoose.model('Track');

function getMetaInfo(zipFilepath, callback) {
	yauzl.open(zipFilepath, function(err, zipfile) {
		if (err) {
			console.error('getMetaInfo error:', err);
			return callback('invalid zip file');
		}

		zipfile.on("entry", function(entry) {
			if (entry.fileName === 'musicEditor.json') {
				var bufferArr = [];
				zipfile.openReadStream(entry
					, function(err, readStream) {
						if (err) {
							console.error('getMetaInfo when read entry error:', err);
							return callback('error when read entry');
						}

						readStream.on('data', function(data) {
							// console.log('data:', data.length);
							bufferArr.push(data);
						});
						readStream.on('error', function(error) {
							console.error('getMetaInfo readStream failed :', error);
							bufferArr.length = 0;
							return callback('error when read entry2');
						});
						readStream.on('end', function() {
							console.log('data read end for file:', entry.fileName);
							var buf = Buffer.concat(bufferArr);
							var meta = JSON.parse(buf);
							bufferArr.length = 0;
							return callback(null, meta);
						});
					});
			}
		});
	});
}

function EncFile(musicFileBuf) {
	return musicFileBuf;
}

function CreateTrack(comingJob, musicAssertPath, zipfile, entry, trackInfo) {
	var q = Q.defer();
	var filename = trackInfo.name;

	var bufferArr = [];
	zipfile.openReadStream(entry
		, function(err, readStream) {
			if (err) {
				console.error('CreateTrack when read entry error:', err);
				return q.reject('CreateTrack when read entry error');
			}

			readStream.on('data', function(data) {
				// console.log('data:', data.length);
				bufferArr.push(data);
			});
			readStream.on('error', function(error) {
				console.error('CreateTrack readStream failed :', error);
				bufferArr.length = 0;
				return q.reject('CreateTrack error when read entry2');
			});
			readStream.on('end', function() {
				console.log('data read end:', entry.fileName);

				//Check whether this file already exist
				Track.findOne({
					hash: trackInfo.hash
				}).exec(function(err, track) {
					if (err) {
						console.log('find track error filename:', filename);
						q.reject('find track error filename');
						bufferArr.length = 0;
						return;
					}
					if (track) {
						track.fromBoxs = _.union(track.fromBoxs, trackInfo.fromBoxs);
						track.save(function (err, upTrack) {
							q.resolve(upTrack);
						});
						console.log('find track already exist filename:', filename);
						bufferArr.length = 0;
						return;
					}

					var musicFileBuf = Buffer.concat(bufferArr);
					bufferArr.length = 0;

					//Create song and write the song to musicAssertPath
					crypto.randomBytes(8, function(ex, buf) {
						var token = buf.toString('hex');
						var rawName = 'raw-' + token + '-' + filename;
						var encName = 'enc-' + token + '-' + filename;
						var targetRawFilePath = path.resolve(musicAssertPath, rawName);
						var targetEncFilePath = path.resolve(musicAssertPath, encName);

						async.series({
						    rawfile: fs.writeFile.bind(fs, targetRawFilePath, musicFileBuf),
						    encfile: fs.writeFile.bind(fs, targetEncFilePath, musicFileBuf),
						},
						function(err, results) {
							console.log('write file results:', results);
							if (err) {
								q.reject('save track file failed');
								return;
							}

						    //Create modal record
							new Track({
								comingJob: comingJob,
								name: filename,
								hash: trackInfo.hash,
								duration: trackInfo.duration,
								fromBoxs: trackInfo.fromBoxs,
								rawfilepath: targetRawFilePath,
								encfilepath: targetEncFilePath
							}).save(function(err, upTrack) {
								console.log('save track success:', filename);
								if (err) {
									console.error('save track failed:', filename);
									q.reject('save track failed');
									return;
								};
								q.resolve(upTrack);
							});
						});

					})
				});
			});
		});

	return q.promise;
}

function CreateJob(comingJob, trackArr, callback) {
	console.log('CreateJob');

	var hashTrackMap = _.zipObject(_.pluck(trackArr, 'hash'), trackArr);
	var meta = comingJob.toObject().meta;

	// Replace dateTemplates.clock.boxes.tracks to track {duration, id}
	_.each(meta.dateTemplates, function (dateTemplate) {
		_.each(dateTemplate.clock.boxes, function (box) {
			var newTrackArr = _.map(box.tracks, function (hash) {
				var track = hashTrackMap[hash];
				return {
					track: track,
					duration: track.duration,
					name: track.name
				};
			});
			box.tracks = newTrackArr;
		});
	});

	new Job(meta).save(callback);
}

function extractData(comingJob, musicAssertPath, callback) {
	var zipFilepath = comingJob.filepath;
	console.log('extract ', zipFilepath);

	// construct targetRelativePath2TrackInfo from meta.tracksMeta
	var meta = comingJob.meta;
	var targetRelativePath2TrackInfo = {};
	_.forOwn(meta.tracksMeta, function (trackInfo, hash) {
		targetRelativePath2TrackInfo[trackInfo.targetRelativePath] = trackInfo;
	});

	// parse music in zip package
	yauzl.open(zipFilepath, function(err, zipfile) {
		if (err) {
			console.error('extractData error:', err);
			return callback('invalid zip file');
		}

		var track_promises = [];

		zipfile.on("entry", function(entry) {
			if (/\/$/.test(entry.fileName)) {
		      // directory file names end with '/' 
		      return;
		    }

		    if (entry.fileName.substr(0, 6) !== 'asset/') {
		    	return;
		    }

		    var targetRelativePath = entry.fileName.substr(6);
		    var trackInfo = targetRelativePath2TrackInfo[targetRelativePath];
		    if (!trackInfo) {
		    	console.warn('targetRelativePath not Exist:', targetRelativePath);
		    } else {
		    	track_promises.push(CreateTrack(comingJob, musicAssertPath, zipfile, entry, trackInfo));
			}
		});

		zipfile.on('end', function () {
			Q.allSettled(track_promises).spread(function() {
			console.log('create all track done');

			var notFulfilled = _.some(arguments, function (defer) {
				return defer.state !== 'fulfilled';
			});
			if (notFulfilled) {
				_.isFunction(callback) && callback('notFulfilled', null);
				return;
			}

			var trackArr = _.pluck(arguments, 'value');
			CreateJob(comingJob, trackArr, function(err, newJob) {
				console.log('after create job err:',err, newJob);
				callback && callback(err, newJob);
			});
		});

		})
	});

	

	console.log('waiting extract');
}

exports = module.exports = {
	getMetaInfo: getMetaInfo,
	extractData: extractData
};