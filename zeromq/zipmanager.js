var JSZip = require("jszip"),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'),
	_ = require('lodash');
var filepath = path.resolve(__dirname, '../uploadAttachment/dj/Archive.zip');

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
			callback('no such file');
			return;
		};
		var buf = metaJson.asNodeBuffer();
		var meta = JSON.parse(buf);
		//maybe check meta later
		callback(null, meta);
	});
}

function extraData(zipFilepath) {
	fs.readFile(filepath, function(err, data) {
		if (err) {
			console.error('read file failed:', filepath);
			callback(err);
			return;
		}
		var zip = new JSZip(data);
		var metaJson = zip.file("musicEditor.json");

		var buf = metaJson.asNodeBuffer();
		// console.log('typeof buf is:', typeof buf);
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
					fs.writeFile(path.resolve(__dirname, path.basename(song.relativePath)),
						musicFileBuf,
						function(err) {
							console.log('write success:', song.relativePath);
						});
				});
			});
	});
}

// getMetaInfo(filepath, function(err, meta) {
// 	console.log(meta);
// });

exports = module.exports = {
	getMetaInfo: getMetaInfo,
	extraData: extraData
};