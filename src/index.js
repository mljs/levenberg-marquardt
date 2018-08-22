import errorCalculation from './errorCalculation';
import step from './step';

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping] - Levenberg-Marquardt parameter
 * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.initialValues] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
 * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
 */
export default function levenbergMarquardt(
  data,
  parameterizedFunction,
  options = {}
) {
  let {
    maxIterations = 100,
    gradientDifference = 10e-2,
    damping = 0,
    maxValue,
    minValue,
    errorTolerance = 10e-3,
    initialValues
  } = options;

  if (damping <= 0) {
    throw new Error('The damping option must be a positive number');
  } else if (!data.x || !data.y) {
    throw new Error('The data parameter must have x and y elements');
  } else if (
    !Array.isArray(data.x) ||
    data.x.length < 2 ||
    !Array.isArray(data.y) ||
    data.y.length < 2
  ) {
    throw new Error(
      'The data parameter elements must be an array with more than 2 points'
    );
  } else if (data.x.length !== data.y.length) {
    throw new Error('The data parameter elements must have the same size');
  }

  var parameters = initialValues || new Array(parameterizedFunction.length).fill(1);
  let parLen = parameters.length;
  maxValue = maxValue || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValue = minValue || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValue.length !== minValue.length) {
    throw new Error('coutes should has the same size');
  }

  if (!Array.isArray(parameters)) {
    throw new Error('initialValues must be an array');
  }

  var error = errorCalculation(data, parameters, parameterizedFunction);

  var converged = error <= errorTolerance;

  for (
    var iteration = 0;
    iteration < maxIterations && !converged;
    iteration++
  ) {
    parameters = step(
      data,
      parameters,
      damping,
      gradientDifference,
      parameterizedFunction
    );

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min(Math.max(minValue[k], parameters[k]), maxValue[k]);
    }

    error = errorCalculation(data, parameters, parameterizedFunction);
    if (isNaN(error)) break;
    converged = error <= errorTolerance;
  }

  return {
    parameterValues: parameters,
    parameterError: error,
    iterations: iteration
  };
}
