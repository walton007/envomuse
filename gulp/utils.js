var gulp = require('gulp');
var del = require('del');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins;

gulp.task('help', plugins.taskListing);

gulp.task('clean', function (cb) {
  return del(['bower_components/build'], cb);
});


gulp.task('addDefaultAdmin', function (cb) {
	require('../packages/users/server/models/user');

	var mean = require('meanio'),
	config = mean.loadConfig();

	var mongoose = require('mongoose'),
	User = mongoose.model('User');

	// run with paramater
	var username = config.adminName,
	password = config.adminPassword ; //'walton.wang1234@qq.com';
	

	User.findOne({username: username}, function (err, theOne) {
		if (err) {
			cb(400, 'findOne fail');
			return;
		}

		if (theOne) {
			console.log('Already Exist. Good!');
			cb();
			mongoose.disconnect();
			return;
		}

		// Create one
		var user = new User({
			name: username,
			username: username,
			password: password,
			email: username,
			provider: 'local',
			roles: ['admin']
		});

		console.log('user:', user);
		user.save(function(err, retUser) {
			mongoose.disconnect();

			console.log('finish save user');
			if (err) {
			  switch (err.code) {
			        case 11000:
			        case 11001:
			        	cb(400, 'Username already taken');
			        	break;
			        default:
			          var modelErrors = [];

			          if (err.errors) {

			            for (var x in err.errors) {
			              modelErrors.push({
			                param: x,
			                msg: err.errors[x].message,
			                value: err.errors[x].value
			              });
			            }

			            cb(400, modelErrors);
			          }
			      }
			  return;
			}

			cb(null, 'Done');
		});

	})

	
});