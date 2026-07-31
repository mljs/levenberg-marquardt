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

## Usage

```js
import { levenbergMarquardt } from 'ml-levenberg-marquardt';

const result = levenbergMarquardt(data, parameterizedFunction, options);
```

- `data` — an object `{ x, y }` where `x` and `y` are arrays (or typed arrays) of the same length.
- `parameterizedFunction` — takes an array of parameters and returns a function of the independent variable.
- `options` — see below. `initialValues` is mandatory.

The returned object has `parameterValues` (the fitted parameters), `parameterError` (the sum of squared weighted residuals) and `iterations` (the number of iterations performed).

## Options

| Option                 | Default | Description                                                                                                       |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `initialValues`        | —       | Array of initial parameter values. Mandatory.                                                                     |
| `weights`              | `1`     | Weighting vector. If its length does not match the number of data points, it is rebuilt from the first value.     |
| `damping`              | `1e-2`  | Levenberg-Marquardt parameter λ; small values give a Gauss-Newton update, large values a gradient descent update. |
| `dampingStepDown`      | `9`     | Factor used to reduce the damping when an update improves the fit.                                                |
| `dampingStepUp`        | `11`    | Factor used to increase the damping when an update does not improve the fit.                                      |
| `improvementThreshold` | `1e-3`  | Threshold defining what counts as an improvement.                                                                 |
| `gradientDifference`   | `10e-2` | Step size used to approximate the jacobian. See below.                                                            |
| `centralDifference`    | `false` | Approximate the jacobian by central differences instead of forward differences. See below.                        |
| `jacobianFunction`     | —       | Analytical jacobian of the model. See below.                                                                      |
| `minValues`            | —       | Minimum allowed values for the parameters.                                                                        |
| `maxValues`            | —       | Maximum allowed values for the parameters.                                                                        |
| `maxIterations`        | `100`   | Maximum number of iterations.                                                                                     |
| `errorTolerance`       | `10e-3` | Stop as soon as the error drops below this value.                                                                 |
| `timeout`              | —       | Maximum running time in seconds; throws when exceeded.                                                            |

### centralDifference

The jacobian matrix is approximated by finite difference; forward differences or central differences (one additional function evaluation). The option centralDifference select one of them, by default the jacobian is calculated by forward difference.

### gradientDifference

The jacobian matrix is approximated as mentioned above, the gradientDifference option is the step size (dp) to calculate the difference between the function with the current parameter state and the perturbation added. It could be a number (same step size for all parameters) or an array with different values for each parameter, if the gradientDifference is zero, the derive will be zero, and the parameter will hold fixed

### jacobianFunction

Instead of approximating the jacobian by finite differences, you can provide it analytically. Like `parameterizedFunction`, it takes the parameter array and returns a function of the independent variable, but that function returns the partial derivatives of the model with respect to every parameter, in the same order as the parameters.

Providing it avoids the extra model evaluation per parameter and is more accurate, so the fit usually converges in fewer iterations. When it is set, `centralDifference` and `gradientDifference` are ignored.

```js
import { levenbergMarquardt } from 'ml-levenberg-marquardt';

// y = slope * x + intercept
function line([slope, intercept]) {
  return (x) => slope * x + intercept;
}

// [dy/dslope, dy/dintercept]
function lineJacobian() {
  return (x) => [x, 1];
}

const x = [0, 1, 2, 3, 4, 5, 6];
const y = [-2, 0, 2, 4, 6, 8, 10];

const result = levenbergMarquardt({ x, y }, line, {
  initialValues: [1, 0],
  jacobianFunction: lineJacobian,
});
console.log(result);
// {
//   parameterValues: [1.9999986750084098, -1.9999943899435104],
//   parameterError: 6.78713215849927e-11,
//   iterations: 2
// }
```

## Examples

### Linear regression

```js
import { levenbergMarquardt } from 'ml-levenberg-marquardt';

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

### Sine fit

```js
import { levenbergMarquardt } from 'ml-levenberg-marquardt';

// function that receives the parameters and returns
// a function with the independent variable as a parameter
function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

// array of points to fit
const data = {
  x: [/* x1, x2, ... */],
  y: [/* y1, y2, ... */],
};

// array of initial parameter values (must be provided)
const initialValues = [/* a, b, c, ... */];

// Optionally, restrict parameters to minimum & maximum values
const minValues = [/* a_min, b_min, c_min, ... */];
const maxValues = [/* a_max, b_max, c_max, ... */];

const options = {
  damping: 1.5,
  initialValues,
  minValues,
  maxValues,
  gradientDifference: 10e-2,
  maxIterations: 100,
  errorTolerance: 10e-3,
};

const result = levenbergMarquardt(data, sinFunction, options);
```

## License

[MIT](./LICENSE)
