'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  root: rootPath,
  http: {
    port: process.env.PORT || 3000
  },
  https: {
    port: false,

    // Paths to key and cert as string
    ssl: {
      // key: path.normalize(__dirname + '/../../keys/privatekey.pem'),
      // cert: path.normalize(__dirname + '/../../keys/.pem')
      key: '',
      cert: ''
    }
  },
  hostname: process.env.HOST || process.env.HOSTNAME,
  db: process.env.MONGOHQ_URL,
  templateEngine: 'swig',

  // The secret should be set to a non-guessable string that
  // is used to compute a session hash
  sessionSecret: 'MEAN',

  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',

  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: true,
    // If secure is set to true then it will cause the cookie to be set
    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
    // set a cookie. 'true' is recommended yet it requires the above
    // mentioned pre-requisite.
    secure: false,
    // Only set the maxAge to null if the cookie shouldn't be expired
    // at all. The cookie will expunge when the browser is closed.
    maxAge: null
  },

  // The session cookie name
  sessionName: 'connect.sid',

  enableZmq: false,
  requireAuth: true,
  pubAddr: "tcp://127.0.0.1:9999",
  pushCmdAddr: "tcp://127.0.0.1:9998",
  musicAssert: "musicAssert",
  adminName: "walton008@qq.com",
  adminPassword: "Initial0",
  DJUploadDir: process.env.DJUPLOADDIR || ''
};
