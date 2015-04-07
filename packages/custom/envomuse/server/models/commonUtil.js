'use strict';
console.log('compile BaseSchema');

require('mongoose-schema-extend');

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Q = require('q');

var BaseSchema = new Schema({
  creatorName: String,
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    required: false
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  modified: {
    type: Date,
    default: Date.now
  },

  deleteFlag: {
    type: Boolean,
    default: false
  },
});

BaseSchema.pre('save', function(next) {
  var User = mongoose.model('User');
  var self = this;
  if (!this.isNew) {
    // console.log('update modified date');
    this.modified = Date.now();
  } else {
    console.log('add new object created:', this.created);
    if (!this.created) {
      this.created = Date.now();
    }
    this.modified = this.created;
  }

  if (this.creator && !this.creatorName) {
    User.findOne({'_id': this.creator}).select('name')
    .exec(function(err, user) {
      // console.log('err: --- ', err, user);
      if (err) {
        next(err);
        return;
      }
      self.creatorName = user.name;
      next();
    });
    return;
  }

  next();
});

BaseSchema.method('markDelete', function() {
  var deferred = Q.defer();
  console.log('markDelete');
  this.deleteFlag = true;
  this.save(function(err, savedObj, numberAffected) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(savedObj);
    }
  });
  return deferred.promise;
});

/*jshint -W020 */
var ContactSchema = {
  name: String, 
  gender: {
    type: String,
    required: true,
    default: 'M',
    enum: ['M', 'F'],
  },
  birthday: Date,
  birthplace: String,
  workmobile: String,
  privatemobile: String,
  fix: String,
  fax: String,
  email: String,
  weixin: String,
  weibo: String,
  qq: String,
  title: String,
  hobby: [String],
  department: {
    type: String,
    required: true,
    default: 'others',
    enum: ['sales', 'markets', 'store', 'others'],
  },
}; 

module.exports = exports = {
  BaseSchema: BaseSchema,
  ContactSchema: ContactSchema
}; 
