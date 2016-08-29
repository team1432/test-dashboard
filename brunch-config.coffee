module.exports =

  files:
    javascripts: joinTo: 'app.js'
    stylesheets: joinTo: 'app.css'

  npm: enabled: false
  modules:
    definition: false
    wrapper: (path, data) ->
      """
      (function() {
        'use strict';
        #{data}
      }).call(this);
      """

  plugins:

    stylus:
      plugins: ['jeet', 'axis']
