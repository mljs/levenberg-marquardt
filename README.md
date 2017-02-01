# levenberg-marquardt

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][codecov-image]][codecov-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]

Curve fitting method in javascript

## Installation

`$ npm install ml-levenberg-marquardt`

## [API Documentation](https://mljs.github.io/levenberg-marquardt/)

This algorithm it's based on the article [Transtrum, Mark K., Benjamin B. Machta, and James P. Sethna. "Geometry of nonlinear least squares with applications to sloppy models and optimization." Physical Review E 83.3 (2011): 036701.](https://doi.org/10.1103/PhysRevE.83.036701)

In order to get a general idea of the problem you could also check the [Wikipedia article](https://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm).

## Example

```js
// import library
const LM = require('ml-levenberg-marquardt');

// function that receives the parameters and returns
// a function with the independent variable as a parameter
function sinFunction (a, b) {
  return (t) => (a * Math.sin(b * t));
}

// array of points to fit
let data = [ /* [x1, y1], [x2, y2], ... */ ];

// array of initial parameter values
let initialValues = [ /* a, b, c, ... */ ];

const options = {
  dampingIncrease: 10e-3,
  dampingDecrease: 10e-3,
  maxIterations: 100
};

let damping = 2;

let fittedParams = LM(data, initialValues, damping, sinFunction, options);
```

Or test it in [Runkit](https://runkit.com/npm/ml-levenberg-marquardt)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-levenberg-marquardt.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ml-levenberg-marquardt
[travis-image]: https://img.shields.io/travis/mljs/levenberg-marquardt/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/levenberg-marquardt
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/levenberg-marquardt.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/mljs/levenberg-marquardt
[david-image]: https://img.shields.io/david/mljs/levenberg-marquardt.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/levenberg-marquardt
[download-image]: https://img.shields.io/npm/dm/ml-levenberg-marquardt.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-levenberg-marquardt
