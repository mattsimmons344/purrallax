;(function($, window, document){

	"use strict";

	//////////
	// Vars //
	//////////

	var pluginName = "purrallax",
		dataKey = 'plugin_' + pluginName,
		defaults = {
			speed: 0.15,
			start: 0,
			stop: 'footer', // selector
			direction: 'down', // or 'up'
			layering: {
				inViewport: 15,
				offViewport: 5
			},
			breakpoint: 720,
			scope: null,
			hook: null
		},
		scrolled = 0,
		requestAnimationFrame = window.requestAnimationFrame || 
	                            window.mozRequestAnimationFrame || 
	                            window.webkitRequestAnimationFrame ||
	                            window.msRequestAnimationFrame;

	////////////
	// Define //
	////////////

	var Plugin = function(element, options) {
		// Set private vars
		this.element = (element.selector) ? element[0] : element;
		this.$element = element;
		this.top = 0;
		this.bottom = 0;
		this.visible = 'visible';
		this.env = {
			width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		};
		this.transformProperty = getSupportedPropertyName(['transform','msTransform','webkitTransform','mozTransform','oTransform']);

		// Spin it up
		this.init(options);

	};


	///////////////
	// Prototype //
	///////////////

	Plugin.prototype = {
		init: function(options) {
			// Settings
			this.settings = $.extend({}, defaults, options);
			this.settings.$stop = $(this.settings.stop);
			this.settings.direction = (this.settings.direction !== 'down') ? '+' : '-';
			this.settings.hasHook = (typeof this.settings.hook === 'function') ? true : false;
			this.scope = (this.settings.scope) ? this.$element.parents(this.settings.scope)[0] : this.$element;
			this.isMobile = (window.innerWidth < this.settings.breakpoint) ? true : false;
			// Functions
			this.findStart();
			this.findStop();
			this.bindEvents();
		},
		findStart: function() {
			this.top = this.settings.start - this.env.height;
			this.topOffset = (this.top <= 0) ? 0 : this.top;
			if (this.topOffset > this.env.height) {
				this.scope.style['z-index'] = this.settings.layering.offViewport;
				this.element.style['top'] = Math.round(this.settings.speed * this.env.height) + 'px';
				this.visible = 'hidden';
			} else {
				this.scope.style['z-index'] = this.settings.layering.inViewport;
			}
		},
		findStop: function() {
			this.isMobile = (window.innerWidth < this.settings.breakpoint) ? true : false;
			if (this.isMobile) { 
				this.element.style[this.transformProperty] = 'translate3d(0,0,0)';
				this.element.style['top'] = '0px';
			}
			this.bottom = this.settings.$stop.offset().top;
		},
		unset: function() {
			$(window).off('scroll', parallax);
			$(window).off('resize', recalc);
		},
		bindEvents: function() {
			var $window = $(window);
			$window.on('scroll', this, parallax);
			$window.on('resize', this, recalc);
		}
	};


	///////////////////////
	// Private Functions //
	///////////////////////

	function getSupportedPropertyName(prop) {
		for (var i = 0; i < prop.length; i++) {
			if (typeof document.body.style[prop[i]] !== 'undefined') {
				return prop[i];
			}
		}
		return null;
	}

	function parallax(_this) {
		_this = _this.data;
		scrolled = window.pageYOffset;
		requestAnimationFrame(function(){
			if (!_this.isMobile && scrolled < _this.bottom && scrolled > _this.top) {
				if (_this.visible === 'hidden') {
					_this.scope.style['z-index'] = _this.settings.layering.inViewport;
					_this.visible = 'visible';
				}
				if (_this.settings.hasHook) {
					_this.settings.hook.call(_this);
				} else {
					_this.element.style[_this.transformProperty] = 'translate3d(0px, ' + _this.settings.direction + ((scrolled - _this.topOffset) * _this.settings.speed) + 'px, 0)';
				}
			} else {
				if (_this.visible === 'visible') {
					_this.scope.style['z-index'] = _this.settings.layering.offViewport;
					_this.visible = 'hidden';
				}
			}
		});
	}

	function recalc(_this) {
		_this = _this.data;
		requestAnimationFrame(function(){
			_this.findStart();
			_this.findStop();
		});
	}

	/////////////////
	// Expose $.fn //
	/////////////////
	$.fn[pluginName] = function (options) {
        var plugin = this.data(dataKey);

        if (plugin instanceof Plugin) {
            plugin.init(options);
        } else {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };


}(jQuery, window, document));
