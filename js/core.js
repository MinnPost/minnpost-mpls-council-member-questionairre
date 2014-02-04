/**
 * Some core functionality for minnpost applications
 */

/**
 * Global variable to hold the "application", templates, and data.
 */
var mpApps = mpApps || {};
var mpTemplates = mpTemplates || {};
mpTemplates['minnpost-mpls-council-member-questionairre'] = mpTemplates['minnpost-mpls-council-member-questionairre'] || {};
var mpData = mpData || {};
mpData['minnpost-mpls-council-member-questionairre'] = mpData['minnpost-mpls-council-member-questionairre'] || {};

/**
 * Extend underscore
 */
_.mixin({
  /**
   * Formats number
   */
  formatNumber: function(num, decimals) {
    decimals = (_.isUndefined(decimals)) ? 2 : decimals;
    var rgx = (/(\d+)(\d{3})/);
    split = num.toFixed(decimals).toString().split('.');

    while (rgx.test(split[0])) {
      split[0] = split[0].replace(rgx, '$1' + ',' + '$2');
    }
    return (decimals) ? split[0] + '.' + split[1] : split[0];
  },

  /**
   * Formats number into currency
   */
  formatCurrency: function(num) {
    return '$' + _.formatNumber(num, 2);
  },

  /**
   * Formats percentage
   */
  formatPercent: function(num) {
    return _.formatNumber(num * 100, 1) + '%';
  },

  /**
   * Formats percent change
   */
  formatPercentChange: function(num) {
    return ((num > 0) ? '+' : '') + _.formatPercent(num);
  }
});

/**
 * Nav stick plugin
 */
(function($) {
  // Plugin for sticking things.  Defaults are for sticking to top.
  var MPStickDefaults = {
    activeClass: 'stuck top',
    wrapperClass: 'minnpost-full-container',
    topPadding: 0,
    throttle: 90
  };
  function MPStick(element, options) {
    // Defined some values and process options
    this.element = element;
    this.$element = $(element);
    this._defaults = MPStickDefaults;
    this.options = $.extend( {}, this._defaults, options);
    this._name = 'mpStick';
    this._scrollEvent = 'scroll.mp.mpStick';
    this._on = false;

    this.init();
  }
  MPStick.prototype = {
    init: function() {
      // If contaier not passed, use parent
      this.$container = (this.options.container === undefined) ? this.$element.parent() : $(this.options.container);

      this.elementHeight = this.$element.outerHeight(true);

      // Create a spacer element so content doesn't jump
      this.$spacer = $('<div>').height(this.elementHeight).hide();
      this.$element.after(this.$spacer);

      // Add wrapper
      if (this.options.wrapperClass) {
        this.$element.wrapInner('<div class="' + this.options.wrapperClass + '"></div>');
      }

      // Throttle the scoll listen for better perfomance
      this._throttledListen = _.bind(_.throttle(this.listen, this.options.throttle), this);
      this._throttledListen();
      $(window).on(this._scrollEvent, this._throttledListen);
    },

    listen: function() {
      var containerTop = this.$container.offset().top;
      var containerBottom = containerTop + this.$container.height();
      var scrollTop = $(window).scrollTop();
      var top = (containerTop - this.options.topPadding);
      var bottom = (containerBottom - this.elementHeight - this.options.topPadding - 2);

      // Test whether we are in the container and whether its
      // already stuck or not
      if (!this._on && scrollTop > top && scrollTop < bottom) {
        this.on();
      }
      else if (this._on && (scrollTop < top || scrollTop > bottom)) {
        this.off();
      }
    },

    on: function() {
      this.$element.addClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', this.options.topPadding);
      }
      this.$spacer.show();
      this._on = true;
    },

    off: function() {
      this.$element.removeClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', 'inherit');
      }
      this.$spacer.hide();
      this._on = false;
    },

    remove: function() {
      this.$container.off(this._scrollEvent);
    }
  };
  // Register plugin
  $.fn.mpStick = function(options) {
    return this.each(function() {
      if (!$.data(this, 'mpStick')) {
        $.data(this, 'mpStick', new MPStick(this, options));
      }
    });
  };
})(jQuery);

/**
 * Create "class" for the main application.  This way it could be
 * used more than once.
 */
(function($, undefined) {
  // Create "class"
  App = mpApps['minnpost-mpls-council-member-questionairre'] = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.$el = $(this.options.el);
    this.templates = mpTemplates['minnpost-mpls-council-member-questionairre'] || {};
    this.data = mpData['minnpost-mpls-council-member-questionairre'] || {};
    this.id = _.uniqueId('mp-');
  };

  _.extend(App.prototype, {
    // Use backbone's extend function
    extend: Backbone.Model.extend,

    // Default options
    defaultOptions: {
      dataPath: './data/',
      imagePath: './css/images/',
      jsonpProxy: 'http://mp-jsonproxy.herokuapp.com/proxy?callback=?&url=',
      localStorageKey: _.uniqueId('minnpost-mpls-council-member-questionairre-'),
      enableStars: false
    },

    /**
     * Template handling.  For development, we want to use
     * the template files directly, but for build, they should be
     * compiled into JS.
     *
     * See JST grunt plugin to understand how templates
     * are compiled.
     *
     * Expects callback like: function(compiledTemplate) {  }
     */
    getTemplates: function(names) {
      var thisApp = this;
      var defers = [];
      names = _.isArray(names) ? names : [names];

      // Go through each file and add to defers
      _.each(names, function(n) {
        var defer;
        var path = 'js/templates/' + n + '.mustache';

        if (_.isUndefined(thisApp.templates[n])) {
          defer = $.ajax({
            url: path,
            method: 'GET',
            async: false,
            contentType: 'text'
          });

          $.when(defer).done(function(data) {
            thisApp.templates[n] = data;
          });
          defers.push(defer);
        }
      });

      return $.when.apply($, defers);
    },
    // Wrapper around getting a template
    template: function(name) {
      return this.templates[name];
    },

    /**
     * Data source handling.  For development, we can call
     * the data directly from the JSON file, but for production
     * we want to proxy for JSONP.
     *
     * `name` should be name of file, minus .json
     *
     * Returns jQuery's defferred object.
     */
    getLocalData: function(name) {
      var thisApp = this;
      var proxyPrefix = this.options.jsonpProxy;
      var useJSONP = false;
      var defers = [];

      name = (_.isArray(name)) ? name : [ name ];

      // If the data path is not relative, then use JSONP
      if (this.options && this.options.dataPath.indexOf('http') === 0) {
        useJSONP = true;
      }

      // Go through each file and add to defers
      _.each(name, function(d) {
        var defer;
        d = d + '.json';

        if (_.isUndefined(thisApp.data[d])) {
          if (useJSONP) {
            defer = $.jsonp({
              url: proxyPrefix + encodeURI(thisApp.options.dataPath + d)
            });
          }
          else {
            defer = $.getJSON(thisApp.options.dataPath + d);
          }

          $.when(defer).done(function(data) {
            thisApp.data[d] = data;
          });
          defers.push(defer);
        }
        else {
          defer = $.Deferred();
          defer.resolveWith(thisApp, [thisApp.data[d]]);
          defers.push(defer);
        }
      });

      return $.when.apply($, defers);
    },

    /**
     * Get remote data.  Provides a wrapper around
     * getting a remote data source, to use a proxy
     * if needed, such as using a cache.
     */
    getRemoteData: function(options) {
      if (this.options.remoteProxy) {
        options.url = options.url + '&callback=proxied_jqjsp';
        options.url = app.options.remoteProxy + encodeURIComponent(options.url);
        options.callback = 'proxied_jqjsp';
        options.cache = true;
      }
      else {
        options.url = options.url + '&callback=?';
      }

      return $.jsonp(options);
    },

    // Placeholder start
    start: function() {
    }
  });
})(jQuery);