import { initializeErrorPropagation, sumOfSquaredResiduals } from './errorCalculation';
import step from './step';
import * as legacy from './legacy';

/**
 * @typedef {Object} Result
 * @property {Array<number>} parameterValues - The computed values of parameters
 * @property {number} residuals - Sum of squared residuals of the final fit
 * @property {number} iterations - Number of iterations used
 */

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>, xError:Array<number>|void, yError:Array<number>|void}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {(...n: number[]) => (x: number) => number} paramFunction - Takes the parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping = 0.1] - Levenberg-Marquardt lambda parameter
 * @param {number} [options.dampingDrop = 0.1] - The constant used to lower the damping parameter
 * @param {number} [options.dampingBoost = 1.5] - The constant used to increase the damping parameter
 * @param {number} [options.maxDamping] - Maximum value for the damping parameter
 * @param {number} [options.minDamping] - Minimum value for the damping parameter
 * @param {number} [options.gradientDifference = 1e-6] - The "infinitesimal" value used to approximate the gradient of the parameter space
 * @param {Array<number>} [options.initialValues] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.residualEpsilon = 1e-6] - Minimum change of the sum of residuals per step – if the sum of residuals changes less than this number, the algorithm will stop
 * @param {Array<number>} [options.maxValues] - Maximum values for the parameters
 * @param {Array<number>} [options.minValues] - Minimum values for the parameters
 * @param {number} [options.errorPropagation = 50] - How many evaluations (per point per step) of the fitted function to use to approximate the error propagation through it
 * @return {Result}
 */
export default function levenbergMarquardt(
  data,
  paramFunction,
  options = {}
) {
  let {
    maxIterations = 100,
    gradientDifference = 1e-6,
    damping = 0.1,
    dampingDrop = 0.1,
    dampingBoost = 1.5,
    maxDamping = Number.MAX_SAFE_INTEGER,
    minDamping = Number.EPSILON,
    maxValues,
    minValues,
    residualEpsilon = 1e-6,
    initialValues,
    errorPropagation = 50
  } = legacy.compatOptions(options);

  if (damping <= 0) {
    throw new Error('The damping option must be a positive number');
  } else if (!data || !data.x || !data.y) {
    throw new Error('The data object must have x and y elements');
  } else if (
    !Array.isArray(data.x) ||
    data.x.length < 2 ||
    !Array.isArray(data.y) ||
    data.y.length < 2
  ) {
    throw new Error(
      'The data must have more than 2 points'
    );
  } else if (data.x.length !== data.y.length) {
    throw new Error('The data object must have equal number of x and y coordinates');
  }

  var params = initialValues;
  let parLen = params.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (!Array.isArray(params)) {
    throw new Error('initialValues must be an array');
  }

  if (maxValues.length !== minValues.length || maxValues.length !== params.length) {
    throw new Error('coutes should has the same size');
  }


  initializeErrorPropagation(errorPropagation);

  /** @type Array<number> */
  var residualDifferences = Array(10).fill(NaN);

  var residuals = sumOfSquaredResiduals(data, params, paramFunction);
  var converged = false;

  for (
    var iteration = 0;
    iteration < maxIterations && !converged;
    iteration++
  ) {
    var params2 = step(
      data,
      params,
      damping,
      gradientDifference,
      paramFunction
    );

    for (let k = 0; k < parLen; k++) {
      params2[k] = Math.min(Math.max(minValues[k], params2[k]), maxValues[k]);
    }

    var residuals2 = sumOfSquaredResiduals(data, params2, paramFunction);

    if (isNaN(residuals2)) throw new Error('The function evaluates to NaN.');
    

    if (residuals2 < residuals) {
      params = params2;
      residuals = residuals2;
      damping *= dampingDrop;
    } else {
      damping *= dampingBoost;
    }

    damping = Math.max( minDamping, Math.min(maxDamping, damping) );

    residualDifferences.shift();
    residualDifferences.push( residuals - residuals2 );
    converged = residualDifferences.reduce((a,b)=>Math.max(a,b)) <= residualEpsilon;

  }

  /** @type {Result} */
  let result = {
    parameterValues: params,
    residuals: sumOfSquaredResiduals(data, params, paramFunction),
    iterations: iteration
  };

  return legacy.compatReturn(result);
}
