acidjs
======

A color picker written in pure javascript + css
* Less than 300 lines of code
* No dependancies
* Tested on Chrome and Firefox

![alt tag](https://raw.github.com/roberttod/acidjs/master/preview.png)

### Example usage

```html
<input type="text" id="acid-picker" />
```

```javascript

var picker = new Acid(document.querySelector("#acid-picker"), {
  initialColor: "red",
  borderWidth: 1,
  width: 12,
  customPalette: [
    "#B22222",
    "#483D8B",
    "#2F4F4F",
    "#778899",
    "#556B2F",
    "#A52A2A",
    "#F4A460",
    "#1E90FF",
    "#FFA500"
  ],
  zoom: "low"
});

picker.on("change", function (val){
  console.log(val)
});

```

### Todo
* ~~Attach to input element~~
* ~~Add commonjs/AMD wrapper~~
* ~~Namespace CSS~~
* ~~Custom swatch options~~
* Embed html5 color picker
* RBG/HSL/HEX inputs
* Gradient picker with hue slider
* Alpha slider
* Parent element collision detection option
* IE compatibility
