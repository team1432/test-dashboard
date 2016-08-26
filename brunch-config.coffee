module.exports =
  npm: enabled: false

  files:
    javascripts: joinTo: 'app.js'
    stylesheets: joinTo: 'app.css'

  modules:
    definition: false
    wrapper: (path, data) ->
      """
      (function() {
        'use strict';
        #{data}
      }).call(this);
      """
