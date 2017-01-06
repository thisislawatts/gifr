/**
 *
 */
(function(window, $) {

var Gfr = function(opts) {
  var _this = this;

  _this.options = $.extend({
    autoPlay: false,
    positioning: '50% 50%',
    preserveAspectRatio: true,
  }, opts);

  // Specifics
  _this.imgWidth = 1920,
  _this.imgHeight = 720;
  _this.imgRatio = this.imgWidth / this.imgHeight;


  _this.$el = _this.options.$el || $('.gif');
  _this.imgSrc = _this.$el.data('src');
  _this.$filmStrip = $('<img src="' + _this.$el.data('src') +'" style="' + _this.getFilmstripStyles() + '"/>');

  _this.$el.append(_this.$filmStrip);

  // Bailout no image found!
  if ( !_this.imgSrc ) {
    return;
  }

  _this.containerHeight = _this.$el.outerHeight();
  _this.containerWidth = _this.$el.width();

  _this.counter = 0;
  _this.imgPointer = 0;

  if ( _this.options.preserveAspectRatio ) {
    _this.containerHeight = _this.containerWidth / _this.imgRatio;
  }

  _this.setup();

  _this.$el.on('mousemove', function(evt) {
      clearInterval(_this.timer);

      var pointer = Math.round( _this.map(evt.clientX, 0, _this.$el.outerWidth(), 0, _this.frameCount() ) );

      _this.positionFrame( pointer );

      clearTimeout( _this.activity );

      if (_this.options.autoPlay) {
        _this.activity = setTimeout(function() {
          _this.start();
        }, 500 );
      }
  });
}

Gfr.prototype.getFilmstripStyles = function() {

  var css = ['position:relative'];
  var positioning = this.options.positioning.split(' ');

  // X
  css.push('margin-left: ' + (this.$el.outerWidth() - this.imgWidth) * (parseInt(positioning[0])/100)+'px')

  // Y
  css.push('margin-top: ' + (this.$el.outerHeight() - this.imgHeight) * (parseInt(positioning[1])/100)+'px')

  return css.join(';');
}

Gfr.prototype.map = function(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

Gfr.prototype.frameCount = function() {
  // Normalize to allow for zeroIndex;
  return (this.img.width / this.imgWidth) - 1;
}

Gfr.prototype.setup = function() {
  var _this = this;

  _this.img = new Image();
  _this.is_landscape = ( _this.containerWidth > _this.containerHeight );
  _this.sizing = _this.is_landscape ? _this.containerWidth : _this.containerHeight ;
  _this.frameWidth = _this.imgWidth;
  _this.assignImage( _this.imgSrc );
}

Gfr.prototype.assignImage = function(src) {
  var _this = this;

  _this.img.src = src;

  this.img.onload = function() {

    setTimeout(function() {
      _this.$el.fadeIn(100);
    }, 500);

    _this.gifHeight = _this.sizing;
    _this.gifWidth = _this.frameWidth * _this.frameCount();

    if (_this.options.autoPlay) {
      _this.start();
    }
  }

}

Gfr.prototype.start = function() {
  var _this = this;

  clearInterval(_this.timer);

  _this.timer = setInterval( function() {
    _this.progressFrame();
  }, 1000 / 12 );
}

Gfr.prototype.positionFrame = function( numberOfFrames ) {
  var _this = this;

  console.log('Position at:', numberOfFrames );
  _this.counter = numberOfFrames;
  _this.$filmStrip.css('transform', 'translateX(' + ((( _this.frameWidth * numberOfFrames )) * -1) +'px)' );
}

Gfr.prototype.progressFrame = function() {
  var _this = this;

  _this.positionFrame( _this.counter );

  if (_this.counter < _this.frameCount() ){
      _this.counter++;
  } else {
      _this.counter = 0;
  }
}

  var g = new Gfr();

  console.log(g);

}(window, window.jQuery))