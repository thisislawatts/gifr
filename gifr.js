var Gfr = function($el, opts) {
  var _this = this;

  _this.options = $.extend(
    {
      autoPlay: false,
      positioning: "50% 50%" /* String, CSS Background positioning */,
      preserveAspectRatio: true,
      sizeToFit: true,
      $target: jQuery($el.data("target")),
      axis: $el.data("axis") || false,
      frameDimensions: $el.data("frame").split("x"),
      sourceDirection: $el.data("sourceDirection") || "horziontal"
    },
    opts
  );

  console.log(_this.options);

  // Direction
  _this.directionOfClip = 1;
  _this.$el = $el;
  _this.$target = _this.options.$target.length
    ? _this.options.$target
    : _this.$el;
  _this.imgSrc = _this.$el.data("src");
  _this.$filmStrip = $(
    '<img src="' +
      _this.$el.data("src") +
      '" class="gifr-filmstrip s__awaiting"/>'
  );

  if (_this.options.frameDimensions) {
    var fdims = _this.options.frameDimensions;
    (_this.originalFrameWidth = (_this.frameWidth = fdims[
      0
    ])), (_this.originalFrameHeight = (_this.frameHeight = fdims[1]));
  } else {
    (_this.originalFrameWidth = (_this.frameWidth = 1920)), (_this.originalFrameHeight = (_this.frameHeight = 698));
  }

  // Specifics
  _this.imgRatio = _this.frameWidth / _this.frameHeight;

  _this.$el.append(_this.$filmStrip);

  // Bailout no image found!
  if (!_this.imgSrc) {
    return;
  }

  _this.containerHeight = _this.$target.outerHeight();
  _this.containerWidth = _this.$target.outerWidth();

  _this.counter = 0;
  _this.imgPointer = 0;

  if (_this.options.preserveAspectRatio) {
    _this.containerHeight = _this.containerWidth / _this.imgRatio;
  }

  _this.setup();

  // Element to bind mousemove to?
  var $mouseEl = _this.$target || jQuery(document);

  _this.pMouseX = 0;
  _this.pMouseY = 0;
  _this.controlAxis = _this.options.axis || "auto";

  // console.log($mouseEl);

  $mouseEl.on("mousemove", function(evt) {
    clearInterval(_this.timer);
    let control = _this.controlAxis;

    if (control === "auto" && (_this.pMouseX > 0 && _this.pMouseY > 0)) {
      var diffX = Math.abs(evt.pageX - _this.pMouseX);
      var diffY = Math.abs(evt.pageY - _this.pMouseY);

      // console.log({x:diffX, y:diffY});
      if (diffX === 0 && diffY === 0) {
        return;
      }

      if (diffX > diffY) {
        _this.controlAxis = (control = "x");
      } else {
        _this.controlAxis = (control = "y");
      }
    }

    _this.pMouseX = evt.pageX;
    _this.pMouseY = evt.pageY;

    var pointer = false;

    if (control === "x") {
      let x = evt.clientX - $mouseEl.offset().left;
      pointer = Math.round(
        _this.map(x, 0, _this.$target.outerWidth(), 0, _this.frameCount() - 1)
      );
    } else if (control === "y") {
      pointer = Math.round(
        _this.map(
          evt.clientY,
          0,
          _this.$target.outerHeight(),
          0,
          _this.frameCount() - 1
        )
      );
    }

    if (pointer < 0) {
      return false;
    }

    _this.positionFrame(pointer);
    _this.$filmStrip.removeClass("s__awaiting");

    clearTimeout(_this.activity);

    if (_this.options.autoPlay) {
      _this.activity = setTimeout(
        function() {
          _this.start();
        },
        1000 / 30
      );
    }
  });
};

Gfr.prototype.getFilmstripStyles = function() {
  var _this = this;
  var css = [
    "position:absolute",
    "top:0",
    "left:0",
    "max-width:none",
    "height: 100%"
  ];
  var positioning = this.options.positioning.split(" ");

  if (this.options.sizeToFit) {
    var coverDimensions = _this.coverDimensions(
      _this.frameWidth,
      _this.frameHeight,
      _this.$target.outerWidth(),
      _this.$target.outerHeight()
    );

    console.log(
      "Resized Dimensions:",
      _this.frameWidth,
      _this.frameHeight,
      coverDimensions,
      _this.frameCount()
    );

    // Increase frame
    _this.frameWidth = coverDimensions.width;
    _this.frameHeight = coverDimensions.height;
    // console.log('Gifr: New Width:', coverDimensions.width, _this.frameCount(), coverDimensions.width * _this.frameCount() );

    if (_this.options.sourceDirection === "horziontal") {
      _this.$filmStrip.attr(
        "width",
        coverDimensions.width * _this.frameCount()
      );
      _this.$filmStrip.attr("height", coverDimensions.height);
      css.push("height:" + coverDimensions.height + "px");
    } else {
      console.log("=> Width:", coverDimensions.width);
      var filmStripHeight = coverDimensions.height * _this.frameCount();
      _this.$filmStrip.attr("width", coverDimensions.width);
      _this.$filmStrip.attr("height", filmStripHeight);
      css.push("width:" + coverDimensions.width + "px");
      css.push("height:" + filmStripHeight + "px");
    }
  }

  // X
  css.push(
    "margin-left: " +
      (_this.$el.outerWidth() - _this.frameWidth) *
        (parseInt(positioning[0], 10) / 100) +
      "px"
  );

  // Y
  // console.log('Gifr:', _this.$el.outerHeight(), _this.frameHeight);
  css.push(
    "margin-top: " +
      (_this.$el.outerHeight() - coverDimensions.height) *
        (parseInt(positioning[1], 10) / 100) +
      "px"
  );
  console.log(
    "Margin top:",
    _this.$el.outerHeight(),
    coverDimensions.height,
    parseInt(positioning[1], 10) / 100
  );
  return css.join(";");
};

Gfr.prototype.map = function(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};

Gfr.prototype.frameCount = function() {
  // Normalize to allow for zeroIndex;
  return parseInt(this.$el.data("framecount"), 10);
};

Gfr.prototype.setup = function() {
  var _this = this;

  _this.img = new Image();
  _this.is_landscape = _this.containerWidth > _this.containerHeight;
  _this.sizing = _this.is_landscape
    ? _this.containerWidth
    : _this.containerHeight;
  _this.assignImage(_this.imgSrc);
  _this.$filmStrip.attr("style", _this.getFilmstripStyles());

  _this.$el.css({
    overflow: "hidden"
  });

  // Reveal filmstrip
  setTimeout(
    function() {
      _this.$filmStrip.removeClass("s__awaiting");
    },
    160
  );
};

Gfr.prototype.assignImage = function(src) {
  var _this = this;

  _this.img.src = src;

  this.img.onload = function() {
    setTimeout(
      function() {
        _this.$el.fadeIn(100);
      },
      500
    );

    _this.gifHeight = _this.sizing;
    _this.gifWidth = _this.frameWidth * _this.frameCount();

    if (_this.options.autoPlay) {
      _this.start();
    }
  };
};

Gfr.prototype.start = function() {
  var _this = this;

  clearInterval(_this.timer);

  _this.timer = setInterval(
    function() {
      _this.progressFrame();
    },
    1000 / 8
  );
};

Gfr.prototype.positionFrame = function(numberOfFrames) {
  var _this = this;

  _this.counter = numberOfFrames;

  if (_this.options.sourceDirection === "horziontal") {
    _this.$filmStrip.css(
      "transform",
      "translateX(" + _this.frameWidth * _this.counter * -1 + "px)"
    );
  } else {
    console.log(
      "Frame size:",
      `${_this.frameWidth} x ${_this.frameHeight}`,
      _this.frameHeight * _this.counter * -1
    );
    _this.$filmStrip.css(
      "transform",
      "translateY(" + _this.frameHeight * _this.counter * -1 + "px)"
    );
  }
};

Gfr.prototype.progressFrame = function() {
  var _this = this;

  _this.positionFrame(_this.counter);

  if (_this.counter < _this.frameCount()) {
    //   _this.counter += _this.directionOfClip;
  } else {
    _this.directionOfClip *= -1;
    //   _this.counter = 0;
  }

  if (_this.counter < 1) {
    _this.directionOfClip = 1;
  }

  _this.counter += _this.directionOfClip;
};

Gfr.prototype.coverDimensions = function(
  childWidth,
  childHeight,
  containerWidth,
  containerHeight
) {
  var scaleFactor = this.max(
    containerWidth / childWidth,
    containerHeight / childHeight
  );

  return {
    width: Math.ceil(childWidth * scaleFactor),
    height: Math.ceil(childHeight * scaleFactor)
  };
};

Gfr.prototype.max = function(a, b) {
  return a > b ? a : b;
};

if (window.module) {
  module.exports = Gfr;
} else {
  var gifrEls = document.querySelectorAll(".gif");

  if (gifrEls) {
    gifrEls.forEach(function(el) {
      new Gfr(jQuery(el));
    });
  }
}
