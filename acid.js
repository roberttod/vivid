(function (global) {

  function Acid (input, options) {

    // Use colorInput or create one
    this.input = input;
    input.style.display = "none";
    this.options = options || {};
    defaults(this.options, {
      width: 12,
      height: 10,
      swatchSize: 14,
      zoom: "low",
      borderWidth: 1,
      initialColor: "black",
      nativePicker: true
    });
    this.initialize();
  }

  Acid.prototype = {
    initialize: function () {
      this.handlers = {};
      this.el = document.createElement("div");
      this.el.className = "acid hidden";
      this.render();
      return this;
    },
    render: function () {
      this.el.innerHTML = "";
      this.button = this._makeButton();
      this.picker = this._makePicker();
      this.overlay = this._makeOverlay();

      this.button.addEventListener("click", this.show.bind(this));
      this.overlay.addEventListener("click", this.hide.bind(this));

      this.el.appendChild(this.button);
      this.el.appendChild(this.picker);
      this.el.appendChild(this.overlay);
      this.input.parentNode.insertBefore(this.el, this.input);

      this._positionPicker();
      this.setColor(this.options.initialColor);
      return this;
    },
    on: function (event, handler, context) {
      this.handlers[event] = this.handlers[event] || [];
      this.handlers[event].push(handler.bind(context || this));
    },
    trigger: function (event, data) {
      if (this.handlers[event]) {
        this.handlers[event].forEach(function (handler) {
          handler(data);
        });
      }
    },
    setColor: function(color) {
      this.preview.style.backgroundColor = color;
      this.button.style.backgroundColor = color;
      this.trigger("change", this.val());
    },
    val: function(options) {
      var rgbString = window.getComputedStyle(this.button).backgroundColor;
      var color = new Color(rgbString);
      return color.get(options);
    },
    show: function (noTrigger) {
      this.el.className = this.el.className.replace(/\s*hidden\s*/, "");
      if (!noTrigger) {
        this.trigger("show");
      }
    },
    hide: function (noTrigger) {
      this.el.className += " hidden";
      if (!noTrigger) {
        this.trigger("hide");
      }
    },
    toggle: function () {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    },
    isVisible: function () {
      return !~this.el.className.split(/\s+/).indexOf("hidden");
    },
    _positionPicker: function () {
      var toggled = false;
      if (!this.isVisible()) {
        toggled = true;
        this.show(true);
      }
      var width = this.picker.offsetWidth;
      this.picker.style.marginLeft = - width / 2 + "px";
      if (toggled) {
        this.hide(true);
      }
    },
    _makeButton: function () {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "picker-btn";
      return button;
    },
    _makeSwatch: function (left, top, rawColor, height) {
      var offsetW = (this.options.width * this.options.swatchSize) - this.options.swatchSize;
      var offsetH = (height * this.options.swatchSize) - this.options.swatchSize;
      var swatch = document.createElement("div");
      var maxOffset = this.options.width - 1;
      var color = new Color(rawColor);
      swatch.style.left = (left * this.options.swatchSize * 2) - offsetW + "px";
      swatch.style.top = (top * 2 * this.options.swatchSize) - offsetH + "px";
      swatch.style.width = this.options.swatchSize - 2 - this.options.borderWidth + "px";
      swatch.style.height = this.options.swatchSize - 2 - this.options.borderWidth + "px";

      // Required to make right column centered
      if (left === maxOffset) {
        swatch.style.right = "-" + swatch.style.left;
        swatch.style.left = "0px";
      }

      swatch.className = color.get({ format: "hsl" }).lightness > 70 ? "light" : "dark";
      swatch.style.backgroundColor = color.get({ format: "hex" });

      swatch.addEventListener("click", function () {
        this.setColor(swatch.style.backgroundColor);
      }.bind(this));

      return swatch;
    },
    _makePalette: function (colorMatrix) {
      var i = 0, j, swatches = [];

      if (!colorMatrix) {
        colorMatrix = this._makeColorMatrix(this.options.width, this.options.height, function (proportionTop) {
          return 0.6 * proportionTop + 0.2;
        });
      }

      var height = Math.ceil(colorMatrix.length / this.options.width);

      var palette = document.createElement("div");
      palette.className = "palette " + (this.options.zoom || "no") + "-zoom";
      palette.style.height = this.options.swatchSize * height - 1 + "px";
      palette.style.width = this.options.swatchSize * this.options.width - 1 + "px";

      this._makeSwatchArray(colorMatrix, palette, this.options.width, height);

      return palette;
    },
    _parseColorArray: function (colorArray) {
      return colorArray.map(this._parseColor, this);
    },
    _parseColor: function (colorString) {
      var color = new Color(colorString);
      return color.get();
    },
    _makeColorMatrix: function (width, height, fn) {
      var colorArray = [];
      var hueOffset = 0;
      for (var top = 0; top < height; top++) {
        var proportionTop = top / height;
        for (var left = 0; left < width; left++) {
          var proportionLeft = left / width;

          // The top row is for greys
          if (top === 0) {
            var hue = 0;
            var lightness = 100 * (1 - proportionLeft);
            var saturation = 0;
          } else {
            var hue = 360 * (left / width) + hueOffset;
            var lightness = 100 * fn(proportionTop);
            if (left === 0) {
              console.log(lightness);
            }
            var saturation = 80;
          }
          colorArray[top * width + left] = {
            hue: hue,
            lightness: lightness,
            saturation: saturation
          };
        }
      }
      return colorArray;
    },
    _makeSwatchArray: function (colorArray, palette, width, height) {
      return colorArray.map(function (color, position) {
        var top = Math.floor(position / width);
        var left = position % width;
        return palette.appendChild(this._makeSwatch(left, top, color, height));
      }, this);
    },
    _makePicker: function () {
      this.preview = document.createElement("div");
      this.preview.className = "preview";
      this.pointer = document.createElement("div");
      this.pointer.className = "pointer";


      var palette = this._makePalette();
      var picker = document.createElement("div");
      picker.className = "picker";
      picker.appendChild(this.pointer);

      if (this.options.customPalette && this.options.customPalette.length) {
        var customPalette = this._makePalette(this._parseColorArray(this.options.customPalette));
        customPalette.style.marginBottom = "5px";
        picker.appendChild(customPalette);
      }
      picker.appendChild(palette);

      if (this.options.nativePicker && this._colorInputSupport) {
        var nativePickerButton = this._makeNativePickerButton();
        picker.appendChild(nativePickerButton);
      }

      return picker;
    },
    _makeNativePickerButton: function () {
      var button = document.createElement("button");
      button.className = "native-button";
      button.innerHTML = "Show Colors";

      nativePicker = document.createElement("input");
      nativePicker.type = "color";
      nativePicker.addEventListener("click", function() {
        // this.hide();
      }.bind(this));
      nativePicker.addEventListener("change", function(e) {
        this.setColor(nativePicker.value);
      }.bind(this));

      this.on("change", function () {
        nativePicker.value = this.val({ format: "hex" });
      });

      button.appendChild(nativePicker);
      return button;
    },
    _makeOverlay: function () {
      var overlay = document.createElement("div");
      overlay.className = "overlay";
      return overlay;
    },
    _colorInputSupport: function () {
      var input = document.createElement("input");
      input.type = "color";
      return input.getAttribute("type") === "color";
    }
  };



  function Color (color) {
    this.set(color);
  }

  Color.prototype = {
    set: function (color) {
      if (typeof color === "string") {
        color = this.parseColorString(color);
      } else if (color.hue !== undefined) {
        color = this.hslToRgb(color);
      }
      this.red = color.red;
      this.green = color.green;
      this.blue = color.blue;
    },
    get: function (options) {
      options = options || {};
      defaults(options, {
        type: options.format === "hex" ? "string" : "object",
        format: "rgb"
      });

      var rgbColor = {
        red: this.red,
        green: this.green,
        blue: this.blue
      };

      var color = options.format === "hsl" ? this.rgbToHsl(rgbColor) : rgbColor;

      if (options.type === "object") {
        return color;
      } else {
        return this.colorToString(color, options.format);
      }
    },
    parseColorString: function (colorString) {
      try {
        var hexMatch = colorString.match(/#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i);
        if (hexMatch) {
          return {
            red: Number("0x" + hexMatch[1]),
            green: Number("0x" + hexMatch[2]),
            blue: Number("0x" + hexMatch[3])
          };
        }

        var rgbMatch = colorString.match(/rgb\D+(\d+\.?\d?)\D+(\d+\.?\d?)\D+(\d+\.?\d?)/);
        if (rgbMatch) {
          return {
            red: Number(rgbMatch[1]),
            green: Number(rgbMatch[2]),
            blue: Number(rgbMatch[3])
          }
        }

        var hslMatch = colorString.match(/hsl\D+(\d+\.?\d?)\D+(\d+\.?\d?)\D+(\d+\.?\d?)/);
        if (hslMatch) {
          return this.hslToRgb({
            hue: Number(hslMatch[1]),
            saturation: Number(hslMatch[2]),
            lightness: Number(hslMatch[3])
          });
        }
      } catch (e) {}

      throw new Error(colorString + " cannot be parsed as a color");
    },
    colorToString: function (color, format) {
      if (format === "hex" || format === "rgb") {
        var red = color.red;
        var green = color.green;
        var blue = color.blue;
        if (format === "hex") {
          return "#" + toHexString(red) + toHexString(green) + toHexString(blue);
        } else {
          return "rgb(" + [red, green, blue].join(",") + ")";
        }
      } else {
        return "hsl(" + [color.hue, color.saturation, color.lightness].join(",") + ")";
      }
    },
    hslToRgb: function hslToRgb(color) {
      var r, g, b;

      var h = (color.hue / 360) % 1;
      var s = color.saturation / 100;
      var l = color.lightness / 100;

      if (s == 0) {
        r = g = b = l;
      } else {
        function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return {
        red: r * 255,
        green: g * 255,
        blue: b * 255
      };
    },
    rgbToHsl: function (color){
      var r = color.red / 255;
      var g = color.green / 255;
      var b = color.blue / 255;

      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if (max == min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {
        hue: h * 360,
        saturation: s * 100,
        lightness: l * 100
      }
    }
  }


  function defaults(options, defaults) {
    for (var key in defaults) {
      if (!(key in options) || options[key] === undefined) {
        options[key] = defaults[key];
      }
    }
    return options;
  }

  function toHexString(num) {
    return ("0" + Math.round(num).toString(16)).slice(-2);
  }

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = Acid;
  } else if ( typeof define === "function" && define.amd ) {
    define(function () { return Acid; });
  } else {
    global.Acid = Acid;
  }

}(this));