/**
 * 
 */
;(function(window, $, undefined) {

var Gfr = function(options) {
  var _this = this;
  
  var options = $.extend(options, {
    preserveAspectRatio: true
  });
  
  _this.$el = options.$el || $('.gif');
  _this.imgSrc = _this.$el.data('src');

  // Bailout no image found!
  if ( !_this.imgSrc )
    return;

  _this.containerHeight = _this.$el.height();
  _this.containerWidth = _this.$el.width();

  _this.counter = 0;
  _this.imgPointer = 0;

  // Specifics
  _this.imgWidth = 400,
  _this.imgHeight = 225;
  _this.imgRatio = this.imgWidth / this.imgHeight;

  if ( options.preserveAspectRatio ) {
    _this.containerHeight = _this.containerWidth / _this.imgRatio;
    _this.$el.css({
      'height': _this.containerHeight
    })
  }

  this.setup();

  _this.$el.on('mousemove', function(evt) {
      clearInterval(_this.timer);

      var pointer = Math.round( _this.map(evt.clientX, 0, window.innerWidth, 0, _this.frameCount() ) );

      _this.positionFrame( _this.frameCount() - pointer );

      clearTimeout( _this.activity );
      
      _this.activity = setTimeout(function() {
        _this.start();
      }, 500 );
  });
}

Gfr.prototype.map = function(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

Gfr.prototype.frameCount = function() {
  return this.img.width / this.imgWidth;
}
  
Gfr.prototype.setup = function() {
  var _this = this;

  _this.img = new Image();
  _this.is_landscape = ( _this.containerWidth > _this.containerHeight );
  _this.sizing = _this.is_landscape ? _this.containerWidth : _this.containerHeight ;

  _this.frameWidth = _this.sizing * _this.imgRatio;
  _this.assignImage( _this.imgSrc );
}

Gfr.prototype.assignImage = function(src) {
  var _this = this;
  
  _this.img.src = src;

  this.img.onload = function() {
    _this.$el.hide().css('background-image', 'url(' + src + ')' );

    setTimeout(function() {
      _this.$el.fadeIn(100);
    }, 500);

    _this.gifHeight = _this.sizing;
    _this.gifWidth = _this.frameWidth * _this.frameCount();

    _this.$el.css({
      'background-size': ( _this.gifWidth ) + 'px ' + (_this.gifHeight) + 'px'
    });

    _this.start();
  }

}

Gfr.prototype.start = function() {
  var _this = this;

  clearInterval(_this.timer);

  _this.timer = setInterval( function() {
    _this.progressFrame();
  }, 1000/ 12 );
}

Gfr.prototype.positionFrame = function( numberOfFrames ) {
  var _this = this;

  _this.counter = numberOfFrames;

  var offset = (_this.containerWidth - _this.frameWidth) *-1;

  _this.$el.css({
    'background-position': ((offset + ( _this.frameWidth * numberOfFrames )) * -1) + 'px ' + ( _this.containerHeight - _this.gifHeight) * .5 + 'px',
  });
}

Gfr.prototype.progressFrame = function() {
  var _this = this;

  _this.positionFrame( _this.counter );
 
  if (_this.counter <= _this.frameCount() ){
      _this.counter++;
  } else {
      _this.counter = 0;
     // _this.changeImage();
  }
}

Gfr.prototype.changeImage = function() {
  var _this = this;

  _this.imgPointer = _this.imgPointer + 1 >= images.length ? 0 : _this.imgPointer + 1;

  this.assignImage( images[_this.imgPointer] )
};


var g = new Gfr();


}(window, window.jQuery))