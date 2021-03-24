# levenberg-marquardt

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Curve fitting method in javascript.

## [API Documentation](https://mljs.github.io/levenberg-marquardt/)

This algorithm is based on the article [Brown, Kenneth M., and J. E. Dennis. "Derivative free analogues of the Levenberg-Marquardt and Gauss algorithms for nonlinear least squares approximation." Numerische Mathematik 18.4 (1971): 289-297.](https://doi.org/10.1007/BF01404679) and [http://people.duke.edu/~hpgavin/ce281/lm.pdf](http://people.duke.edu/~hpgavin/ce281/lm.pdf)

In order to get a general idea of the problem you could also check the [Wikipedia article](https://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm).

## Installation

`$ npm i ml-levenberg-marquardt`

## Options

Next there is some options could change the behavior of the code.

### centralDifference

The jacobian matrix is approximated by finite difference; forward differences or central differences (one additional function evaluation). The option centralDifference select one of them, by default the jacobian is calculated by forward difference.

### gradientDifference

The jacobian matrix is approximated as mention above, the gradientDifference option is the step size (dp) to calculate de difference between the function with the current parameter state and the perturbation added. It could be a number (same step size for all parameters) or an array with different values for each parameter, if the gradientDifference is zero the derive will be zero, and the parameter will hold fixed

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
  ],
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
  errorTolerance: 10e-3,
};

let fittedParams = LM(data, sinFunction, options);
```

Or test it in [Runkit](https://runkit.com/npm/ml-levenberg-marquardt)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-levenberg-marquardt.svg
[npm-url]: https://npmjs.org/package/ml-levenberg-marquardt
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/levenberg-marquardt.svg
[codecov-url]: https://codecov.io/gh/mljs/levenberg-marquardt
[ci-image]: https://github.com/mljs/levenberg-marquardt/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/mljs/levenberg-marquardt/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/ml-levenberg-marquardt.svg
[download-url]: https://npmjs.org/package/ml-levenberg-marquardt
