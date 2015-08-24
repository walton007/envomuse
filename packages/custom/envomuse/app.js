'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Envomuse = new Module('envomuse');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Envomuse.register(function(app, auth,users, database, passport) {

  //We enable routing. By default the Package Object is passed to the routes
  Envomuse.routes(app, auth, database, passport);

  //We are adding a link to the main menu for all authenticated users
  Envomuse.menus.add({
    title: 'envomuse example page',
    link: 'envomuse example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  // Envomuse.aggregateAsset('css', 'envomuse.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Envomuse.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Envomuse.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Envomuse.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Envomuse;
});
