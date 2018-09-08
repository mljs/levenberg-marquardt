import { initializeErrorPropagation, sumOfResiduals, sumOfSquaredResiduals } from './errorCalculation';
import step from './step';

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>, xError:Array<number>|void, yError:Array<number>|void}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping] - Levenberg-Marquardt parameter
 * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.initialValues] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 0] - Minimum change of the sum of residuals per step – if the sum of residuals changes less than this number, the algorithm will stop
 * @param {Array<number>} [options.maxValues] - Maximum values for the parameters
 * @param {Array<number>} [options.minValues] - Minimum values for the parameters
 * @param {{rough: number, fine: number}} [options.errorPropagation] - How many evaluations (per point per step) of the fitted function to use to approximate the error propagation through it
 * @param {number} [options.errorPropagation.rough = 10] - Number of iterations for rough estimation
 * @param {number} [options.errorPropagation.fine = 50] - Number of iterations for fine estimation
 * @return {Result}
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
    maxValues,
    minValues,
    errorTolerance = -1,
    initialValues,
    errorPropagation = { rough: 10, fine: 50 }
  } = options;

  let {
    roughError = 10,
    fineError = 50
  } = errorPropagation;

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
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('coutes should has the same size');
  }

  if (!Array.isArray(parameters)) {
    throw new Error('initialValues must be an array');
  }


  initializeErrorPropagation(roughError);

  var lastResiduals = 0;
  var residuals = sumOfResiduals(data, parameters, parameterizedFunction);
  var converged = false;
  var fine = false;

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
      parameters[k] = Math.min(Math.max(minValues[k], parameters[k]), maxValues[k]);
    }

    lastResiduals = residuals;
    residuals = sumOfResiduals(data, parameters, parameterizedFunction);
    if (isNaN(residuals)) break;
    converged = lastResiduals - residuals <= errorTolerance;

    if (converged && !fine) {
      initializeErrorPropagation(fineError);
      converged = false;
      fine = true;
    }
  }

  /**
   * @typedef {Object} Result
   * @property {Array<number>} parameterValues - The computed values of parameters
   * @property {number} residuals - Sum of squared residuals of the final fit
   * @property {number} iterations - Number of iterations used
   */
  return {
    parameterValues: parameters,
    residuals: sumOfSquaredResiduals(data, parameters, parameterizedFunction),
    iterations: iteration
  };
}
