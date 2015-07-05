require('../packages/custom/envomuse/server/models/song');

var JSZip = require("jszip"),
	path = require('path'),
	fs = require('fs'),
	Q = require('q'),
	crypto = require('crypto'),
	_ = require('lodash');
// var filepath = path.resolve(__dirname, '../uploadAttachment/dj/Archive.zip');



var mongoose = require('mongoose'),
	Job = mongoose.model('Job'),
	Track = mongoose.model('Track'),
	Song = mongoose.model('Song');

function getMetaInfo(zipFilepath, callback) {
	fs.readFile(zipFilepath, function(err, data) {
		if (err) {
			console.error('read file failed:', filepath);
			callback(err);
			return;
		}
		var zip = new JSZip(data);
		var metaJson = zip.file("musicEditor.json");
		if (!metaJson) {
			callback('invalid zip file');
			return;
		};
		var buf = metaJson.asNodeBuffer();
		var meta = JSON.parse(buf);
		//maybe check meta later
		callback(null, meta);
	});
}

function EncFile(musicFileBuf) {
	return musicFileBuf;
}

function CreateTrack(comingJob, musicAssertPath, musicFileBuf, trackInfo) {
	var q = Q.defer();
	var filename = trackInfo.name;

	//Check whether this file already exist
	Track.findOne({
		hash: trackInfo.hash
	}).exec(function(err, track) {
		if (err) {
			console.log('find track error filename:', filename);
			q.reject('find track error filename');
			return;
		};
		if (track) {
			track.fromBoxs = _.union(track.fromBoxs, trackInfo.fromBoxs);
			track.save(function (err, upTrack) {
				q.resolve(upTrack);
			});
			console.log('find track already exist filename:', filename);
			return;
		};
		//Create song and write the song to musicAssertPath
		crypto.randomBytes(8, function(ex, buf) {
			var token = buf.toString('hex');
			var rawName = 'raw-' + token + '-' + filename;
			var encName = 'enc-' + token + '-' + filename;
			var targetRawFilePath = path.resolve(musicAssertPath, rawName);
			var targetEncFilePath = path.resolve(musicAssertPath, encName);
			fs.writeFile(targetRawFilePath, musicFileBuf, 
				function(err) {
					if (err) {console.error('Failed to writeFile:',  targetRawFilePath); return;}
					console.log('writeFile Success:', targetRawFilePath);
				});
			fs.writeFile(targetEncFilePath, EncFile(musicFileBuf),
				function(err) {
					if (err) {console.error('Failed to write enc File:',  targetEncFilePath); return;}
					console.log('write enc File Success:', targetEncFilePath);
				});

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
				if (err) {
					console.error('save track failed:', filename);
					q.reject('save track failed');
					return;
				};
				console.log('save track success:', filename);
				q.resolve(upTrack);
			});
		})

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
	fs.readFile(zipFilepath, function(err, data) {
		console.log('extract 1');
		if (err) {
			console.error('read file failed:', filepath);
			callback(err);
			return;
		}
		var zip = new JSZip(data);
		var track_promises = [];
		var meta = comingJob.meta;

		console.log('extract 2');
		
		_.forOwn(meta.tracksMeta, function (trackInfo, hash) {
			var musicFileBuf = zip.file('asset/' + trackInfo.targetRelativePath).asNodeBuffer();
			console.log('musicFileBuf length:', musicFileBuf.length, ' hash:', hash);
			track_promises.push(CreateTrack(comingJob, musicAssertPath, musicFileBuf, trackInfo));
		});

		console.log('extract 3');
		//Create Job
		Q.allSettled(track_promises).spread(function() {
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

		console.log('extract 4');
	});
}

exports = module.exports = {
	getMetaInfo: getMetaInfo,
	extractData: extractData
};