acid.js
======

A color picker written in pure javascript + css
* Less than 300 lines of css + javascript
* No dependancies
* Tested on Chrome and Firefox

Example usage

```javascript

window.picker = new Acid({
  initialColor: "red",
  borderWidth: 1,
  zoom: "low"
}).render();

document.body.appendChild(picker.el);

picker.on("change", function (val){
  console.log(val);
});

```

