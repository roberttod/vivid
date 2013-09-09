function makeSwatch (size, swatchSize, top, left) {
  var offset = (size * swatchSize) - swatchSize;
  var swatch = document.createElement("div");
  swatch.style.left = (left * swatchSize * 2) - offset + "px";
  swatch.style.top = (top * 2 * swatchSize) - offset + "px";
  swatch.style.width = swatchSize + "px";
  swatch.style.height = swatchSize + "px";

  if (top === 0) {
    var hue = 0;
    var lightness = 100 * ((size - left) / size) +"%";
    var saturation = "0%";
  } else {
    var hue = 360 * (left / size);
    var lightness = 20 + ((70 * (top / size))) + "%";
    var saturation = "80%";
  }

  swatch.style.backgroundColor = "hsl(" + hue + ", " + saturation + ", " + lightness + ")";

  return swatch;
}

function makePalette (size, swatchSize) {
  var i = 0, j, swatches = [];

  var palette = document.createElement("div");
  palette.className = "palette";
  palette.style.height = swatchSize * size + "px";
  palette.style.width = swatchSize * size + "px";

  for (; i < size; i++) {
    j = 0;
    swatches[i] = [];
    for (; j < size; j++) {
      swatches[i][j] = makeSwatch(size, swatchSize, i, j);
      palette.appendChild(swatches[i][j]);
    }
  }

  return palette;

}

document.addEventListener("DOMContentLoaded", function () {
  document.body.appendChild(makePalette(10, 15));
});