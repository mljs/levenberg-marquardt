const levenbergMarquardt = require('ml-levenberg-marquardt');

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

var len = 20;
var data = {
  x: new Array(len),
  y: new Array(len)
};
var sampleFunction = sinFunction([2, 2]);
for (var i = 0; i < len; i++) {
  data.x[i] = i;
  data.y[i] = sampleFunction(i);
}
const options = {
  damping: 0.001,
  initialValues: [3, 3]
};

var ans = levenbergMarquardt(data, sinFunction, options);
console.log(ans);
