function defaults(options, defaults) {
  for (var key in defaults) {
    if (!(key in options) || options[key] === undefined) {
      options[key] = defaults[key];
    }
  }
  return options;
}

function Acid (options) {
  this.options = options || {};
  defaults(this.options, {
    size: 10,
    swatchSize: 15,
    zoom: "low",
    borderWidth: 1
  });
  this.initialize();
}

Acid.prototype = {
  initialize: function () {
    this.el = document.createElement("div");
    return this;
  },
  render: function () {
    this.el.innerHTML = "";
    this.el.appendChild(this.makePicker());
    return this;
  },
  makeSwatch: function (top, left) {
    var offset = (this.options.size * this.options.swatchSize) - this.options.swatchSize;
    var swatch = document.createElement("div");
    swatch.style.left = (left * this.options.swatchSize * 2) - offset + "px";
    swatch.style.top = (top * 2 * this.options.swatchSize) - offset + "px";
    swatch.style.width = this.options.swatchSize - 2 - this.options.borderWidth + "px";
    swatch.style.height = this.options.swatchSize - 2 - this.options.borderWidth + "px";

    // Required to make right column centered
    if (left === this.options.size - 1) {
      swatch.style.right = "-" + swatch.style.left;
      swatch.style.left = "0px";
    }

    // The top row is for greys
    if (top === 0) {
      var hue = 0;
      var lightness = 100 * ((this.options.size - left) / this.options.size);
      var saturation = "0%";
    } else {
      var hue = 360 * (left / this.options.size);
      var lightness = 20 + ((70 * (top / this.options.size)));
      var saturation = "80%";
    }

    swatch.className = lightness > 70 ? "light" : "dark";

    swatch.style.backgroundColor = "hsl(" + hue + ", " + saturation + ", " + lightness + "%)";

    swatch.addEventListener("click", function () {
      this.preview.style.backgroundColor = swatch.style.backgroundColor;
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
    var palette = this.makePalette();

    var picker = document.createElement("div");
    picker.className = "picker";
    picker.appendChild(this.preview);
    picker.appendChild(palette);
    return picker;
  }
};