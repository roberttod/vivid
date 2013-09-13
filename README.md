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
  borderWidth: 1
});

picker.on("change", function (val){
  console.log(val);
});

```

### Todo
* ~~Attach to input element~~
* ~~Add commonjs/AMD wrapper~~
* ~~Namespace CSS~~
* Parent element collision detection option
* RBG/HSL/HEX inputs
