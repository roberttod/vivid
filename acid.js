(function (global) {

  function defaults(options, defaults) {
    for (var key in defaults) {
      if (!(key in options) || options[key] === undefined) {
        options[key] = defaults[key];
      }
    }
    return options;
  }

  function Acid (input, options) {

    // Use colorInput or create one
    this.input = input;
    input.style.display = "none";
    this.options = options || {};
    defaults(this.options, {
      size: 10,
      swatchSize: 15,
      zoom: "low",
      borderWidth: 1,
      initialColor: "black"
    });
    this.initialize();
  }

  Acid.prototype = {
    initialize: function () {
      this.handlers = {};
      this.el = document.createElement("div");
      this.el.className = "acid";
      this.render();
      return this;
    },
    render: function () {
      this.el.innerHTML = "";
      this.button = this.makeButton();
      this.picker = this.makePicker();
      this.overlay = this.makeOverlay();

      this.button.addEventListener("click", this.show.bind(this));
      this.overlay.addEventListener("click", this.hide.bind(this));

      this.el.appendChild(this.button);
      this.el.appendChild(this.picker);
      this.el.appendChild(this.overlay);
      this.input.parentNode.insertBefore(this.el, this.input);

      this.positionPicker();
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
    show: function (noTrigger) {
      this.el.className += " active";
      if (!noTrigger) {
        this.trigger("show");
      }
    },
    hide: function (noTrigger) {
      this.el.className = this.el.className.replace("active", "");
      if (!noTrigger) {
        this.trigger("hide");
      }
    },
    toggle: function () {
      if (this.visible()) {
        this.hide();
      } else {
        this.show();
      }
    },
    visible: function () {
      return ~this.el.className.split(" ").indexOf("active");
    },
    positionPicker: function () {
      var toggled = false;
      if (!this.visible()) {
        toggled = true;
        this.show(true);
      }
      var width = this.picker.offsetWidth;
      this.picker.style.marginLeft = - width / 2 + "px";
      if (toggled) {
        this.hide(true);
      }
    },
    setColor: function(color) {
      this.preview.style.backgroundColor = color;
      this.button.style.backgroundColor = color;
      this.trigger("change", this.val());
    },
    val: function(color) {
      return window.getComputedStyle(this.preview).backgroundColor;
    },
    makeButton: function () {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "picker-btn";
      return button;
    },
    makeSwatch: function (top, left) {
      var offset = (this.options.size * this.options.swatchSize) - this.options.swatchSize;
      var swatch = document.createElement("div");
      var maxOffset = this.options.size - 1;
      swatch.style.left = (left * this.options.swatchSize * 2) - offset + "px";
      swatch.style.top = (top * 2 * this.options.swatchSize) - offset + "px";
      swatch.style.width = this.options.swatchSize - 2 - this.options.borderWidth + "px";
      swatch.style.height = this.options.swatchSize - 2 - this.options.borderWidth + "px";

      // Required to make right column centered
      if (left === maxOffset) {
        swatch.style.right = "-" + swatch.style.left;
        swatch.style.left = "0px";
      }

      // The top row is for greys
      if (top === 0) {
        var hue = 0;
        var lightness = 100 * ((maxOffset - left) / maxOffset);
        var saturation = "0%";
      } else {
        var hue = 360 * (left / this.options.size);
        var lightness = 20 + ((70 * (top / maxOffset)));
        var saturation = "80%";
      }

      swatch.className = lightness > 70 ? "light" : "dark";

      swatch.style.backgroundColor = "hsl(" + hue + ", " + saturation + ", " + lightness + "%)";

      swatch.addEventListener("click", function () {
        this.setColor(swatch.style.backgroundColor);
      }.bind(this));

      return swatch;
    },
    makePalette: function () {
      var i = 0, j, swatches = [];

      var palette = document.createElement("div");
      palette.className = "palette " + (this.options.zoom || "no") + "-zoom";
      palette.style.height = this.options.swatchSize * this.options.size - 1 + "px";
      palette.style.width = this.options.swatchSize * this.options.size - 1 + "px";

      for (; i < this.options.size; i++) {
        j = 0;
        swatches[i] = [];
        for (; j < this.options.size; j++) {
          swatches[i][j] = this.makeSwatch(i, j);
          palette.appendChild(swatches[i][j]);
        }
      }
      this.swatches = swatches;

      return palette;
    },
    makePicker: function () {
      this.preview = document.createElement("div");
      this.preview.className = "preview";
      this.pointer = document.createElement("div");
      this.pointer.className = "pointer";
      var palette = this.makePalette();

      var picker = document.createElement("div");
      picker.className = "picker";
      picker.appendChild(this.pointer);
      picker.appendChild(this.preview);
      picker.appendChild(palette);
      return picker;
    },
    makeOverlay: function () {
      var overlay = document.createElement("div");
      overlay.className = "overlay";
      return overlay;
    }
  };

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = Acid;
  } else if ( typeof define === "function" && define.amd ) {
    define(function () { return Acid; });
  } else {
    global.Acid = Acid;
  }

}(this));