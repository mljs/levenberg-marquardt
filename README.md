# ml-levenberg-marquardt

[![NPM version](https://img.shields.io/npm/v/ml-levenberg-marquardt.svg)](https://www.npmjs.com/package/ml-levenberg-marquardt)
[![npm download](https://img.shields.io/npm/dm/ml-levenberg-marquardt.svg)](https://www.npmjs.com/package/ml-levenberg-marquardt)
[![test coverage](https://img.shields.io/codecov/c/github/mljs/levenberg-marquardt.svg)](https://codecov.io/gh/mljs/levenberg-marquardt)
[![license](https://img.shields.io/npm/l/ml-levenberg-marquardt.svg)](https://github.com/mljs/levenberg-marquardt/blob/main/LICENSE)

Curve fitting method in javascript.

## [API Documentation](https://mljs.github.io/levenberg-marquardt/)

This algorithm is based on the article [Brown, Kenneth M., and J. E. Dennis. "Derivative free analogues of the Levenberg-Marquardt and Gauss algorithms for nonlinear least squares approximation." Numerische Mathematik 18.4 (1971): 289-297.](https://doi.org/10.1007/BF01404679) and [http://people.duke.edu/~hpgavin/ce281/lm.pdf](http://people.duke.edu/~hpgavin/ce281/lm.pdf)

To get a general idea of the problem, you could also check the [Wikipedia article](https://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm).

## Installation

```console
npm i ml-levenberg-marquardt
```

## Options

Next, there are some options could change the behaviour of the code.

### centralDifference

The jacobian matrix is approximated by finite difference; forward differences or central differences (one additional function evaluation). The option centralDifference select one of them, by default the jacobian is calculated by forward difference.

### gradientDifference

The jacobian matrix is approximated as mentioned above, the gradientDifference option is the step size (dp) to calculate the difference between the function with the current parameter state and the perturbation added. It could be a number (same step size for all parameters) or an array with different values for each parameter, if the gradientDifference is zero, the derive will be zero, and the parameter will hold fixed

## Examples

### Linear regression

```js
import { levenbergMarquardt } from 'ml-levenberg-marquardt';
// const { levenbergMarquardt } = require("ml-levenberg-marquardt");

// Creates linear function using the provided slope and intercept parameters
function line([slope, intercept]) {
  return (x) => slope * x + intercept;
}

// Input points (x,y)
const x = [0, 1, 2, 3, 4, 5, 6];
const y = [-2, 0, 2, 4, 6, 8, 10];

// Parameter values to use for first iteration
const initialValues = [1, 0]; // i.e., y = x

const result = levenbergMarquardt({ x, y }, line, { initialValues });
console.log(result);
// {
//   parameterValues: [1.9999986750084096, -1.9999943899435104]
//   parameterError: 6.787132159723697e-11
//   iterations: 2
// }
```

### Exponential fit

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

// array of initial parameter values (must be provided)
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

## License

[MIT](./LICENSE)
