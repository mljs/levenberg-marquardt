import isArray from 'is-any-array';

import errorCalculation from './errorCalculation';
import step from './step';

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping] - Levenberg-Marquardt parameter
 * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.minValues] - Minimum allowed values for parameters
 * @param {Array<number>} [options.maxValues] - Maximum allowed values for parameters
 * @param {Array<number>} [options.initialValues] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
 * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
 */
export default function levenbergMarquardt(
  data,
  parameterizedFunction,
  options = {},
) {
  let {
    maxIterations = 100,
    gradientDifference = 10e-2,
    damping = 0,
    errorTolerance = 10e-3,
    minValues,
    maxValues,
    initialValues,
  } = options;

  if (damping <= 0) {
    throw new Error('The damping option must be a positive number');
  } else if (!data.x || !data.y) {
    throw new Error('The data parameter must have x and y elements');
  } else if (
    !isArray(data.x) ||
    data.x.length < 2 ||
    !isArray(data.y) ||
    data.y.length < 2
  ) {
    throw new Error(
      'The data parameter elements must be an array with more than 2 points',
    );
  } else if (data.x.length !== data.y.length) {
    throw new Error('The data parameter elements must have the same size');
  }

  let parameters =
    initialValues || new Array(parameterizedFunction.length).fill(1);
  let parLen = parameters.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('minValues and maxValues must be the same size');
  }

  if (!isArray(parameters)) {
    throw new Error('initialValues must be an array');
  }

  let error = errorCalculation(data, parameters, parameterizedFunction);

  let converged = error <= errorTolerance;

  let iteration;
  for (iteration = 0; iteration < maxIterations && !converged; iteration++) {
    parameters = step(
      data,
      parameters,
      damping,
      gradientDifference,
      parameterizedFunction,
    );

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min(
        Math.max(minValues[k], parameters[k]),
        maxValues[k],
      );
    }

    error = errorCalculation(data, parameters, parameterizedFunction);
    if (isNaN(error)) break;
    converged = error <= errorTolerance;
  }

  return {
    parameterValues: parameters,
    parameterError: error,
    iterations: iteration,
  };
}
