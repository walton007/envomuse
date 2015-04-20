require('../packages/custom/envomuse/server/models/song');

var JSZip = require("jszip"),
	path = require('path'),
	fs = require('fs'),
	Q = require('q'),
	crypto = require('crypto'),
	_ = require('lodash');
var filepath = path.resolve(__dirname, '../uploadAttachment/dj/Archive.zip');



var mongoose = require('mongoose'),
	Job = mongoose.model('Job'),
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

function CreateSong(comingJob, musicAssertPath, filename, musicFileBuf, hash, key) {
	var q = Q.defer();

	//Check whether this file already exist
	Song.findOne({
		hash: hash
	}).exec(function(err, song) {
		if (err) {
			console.log('find song error filename:', filename);
			q.reject('find song error filename');
			return;
		};
		if (song) {
			console.log('find song already exist filename:', filename);
			q.resolve({
				song: song,
				key: key
			});
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
			new Song({
				comingJob: comingJob,
				name: filename,
				hash: hash,
				rawfilepath: targetRawFilePath,
				encfilepath: targetEncFilePath
			}).save(function(err, song) {
				if (err) {
					console.error('save song failed:', filename);
					q.reject('save song failed');
					return;
				};
				console.log('save song success:', filename);
				q.resolve({
					song: song,
					key: key
				});
			});
		})

	});

	return q.promise;
}

function CreateJob(comingJob, validSongMap, callback) {
	var jsonObj = comingJob.toObject();
	_(jsonObj.boxes)
		.each(function(box) {
			_(box.songlist).each(function(song) {
				if (song.relativePath in validSongMap) {
					song.songid = validSongMap[song.relativePath];
					delete song.relativePath;
				};

			});
		});

	new Job({
		uuid: jsonObj.uuid,
		creator: jsonObj.creator,
		programName: jsonObj.programName,
		custumorName: jsonObj.custumorName,
		programRule: jsonObj.programRule
	}).save(callback);
}

function extraData(comingJob, musicAssertPath, callback) {
	var zipFilepath = comingJob.filepath;
	fs.readFile(filepath, function(err, data) {
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

		var song_promises = [];
		var buf = metaJson.asNodeBuffer();
		var meta = JSON.parse(buf);
		_(meta.programRule.boxes)
			.each(function(box) {
				console.log('box.description:', box.description);
				_(box.songlist).each(function(song) {
					console.log(song.relativePath);
					var musicFileBuf = zip.file('music/' + song.relativePath).asNodeBuffer();
					var md5 = crypto.createHash('md5');
					md5.update(musicFileBuf);
					var hash = md5.digest('hex');
					console.log('musicFileBuf length:', musicFileBuf.length, ' hash:', hash);
					song_promises.push(CreateSong(comingJob, musicAssertPath, path.basename(song.relativePath), musicFileBuf, hash, song.relativePath));
				});
			});
		//Create Job
		Q.allSettled(song_promises).spread(function() {
			var validSongMap = {};
			var songsArr = arguments;
			Object.keys(songsArr).forEach(function(key) {
				var objVal = songsArr[key];
				if (objVal.state === 'fulfilled') {
					validSongMap[objVal.value.key] = objVal.value.song;
				}
			});
			console.log('validSongMap:', validSongMap);
			// respCallback && respCallback(validComingJobs);
			CreateJob(comingJob, validSongMap, function(err, newJob) {
				callback && callback(err, newJob);
			});
		});
	});
}

exports = module.exports = {
	getMetaInfo: getMetaInfo,
	extraData: extraData
};