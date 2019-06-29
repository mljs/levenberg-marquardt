# levenberg-marquardt

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Curve fitting method in javascript.

## Installation

`$ npm i ml-levenberg-marquardt`

## [API Documentation](https://mljs.github.io/levenberg-marquardt/)

This algorithm is based on the article [Brown, Kenneth M., and J. E. Dennis. "Derivative free analogues of the Levenberg-Marquardt and Gauss algorithms for nonlinear least squares approximation." Numerische Mathematik 18.4 (1971): 289-297.](https://doi.org/10.1007/BF01404679)

In order to get a general idea of the problem you could also check the [Wikipedia article](https://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm).

## Example

```js
// import library
import LM from 'ml-levenberg-marquardt';
// const LM = require('ml-levenberg-marquardt').default;

// function that receives the parameters and returns
// a function with the independent variable as a parameter
function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

// array of points to fit
let data = {
  x: [
    /* x1, x2, ... */
  ],
  y: [
    /* y1, y2, ... */
  ]
};

// array of initial parameter values
let initialValues = [
  /* a, b, c, ... */
];

// Optionally, restrict parameters to minimum & maximum values
let minValues = [
  /* a_min, b_min, c_min, ... */
];
let maxValues = [
  /* a_max, b_max, c_max, ... */
];

const options = {
  damping: 1.5,
  initialValues: initialValues,
  minValues: minValues,
  maxValues: maxValues,
  gradientDifference: 10e-2,
  maxIterations: 100,
  errorTolerance: 10e-3
};

let fittedParams = LM(data, sinFunction, options);
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
[download-image]: https://img.shields.io/npm/dm/ml-levenberg-marquardt.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-levenberg-marquardt
