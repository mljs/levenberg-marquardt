import isArray from 'is-any-array';

import errorCalculation from './errorCalculation';
import step from './step';

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping = 0] - Levenberg-Marquardt parameter, small values of the damping parameter λ result in a Gauss-Newton update and large
values of λ result in a gradient descent update
 * @param {number|array} [options.gradientDifference = 10e-2] - The step size to approximate the jacobian matrix
 * @param {boolean} [options.centralDifference = false] - If true the jacobian matrix is approximated by central differences otherwise by forward differences
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
    centralDifference = false,
    gradientDifference = 10e-2,
    damping = 0,
    dampingStepDown = 9,
    dampingStepUp = 11,
    errorTolerance = 1e-7,
    minValues,
    maxValues,
    initialValues,
    improvementThreshold = 1e-3,
    weights = 1,
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

  let nbPoints = data.y.length;
  let parLen = parameters.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('minValues and maxValues must be the same size');
  }

  if (!isArray(parameters)) {
    throw new Error('initialValues must be an array');
  }

  if (isArray(gradientDifference) && gradientDifference.length !== parLen) {
    gradientDifference = new Array(parLen).fill(gradientDifference[0]);
  } else if (typeof gradientDifference === 'number') {
    gradientDifference = new Array(parameters.length).fill(gradientDifference);
  }

  let filler;
  if (typeof weights === 'number') {
    let value = 1 / weights ** 2;
    filler = () => value;
  } else if (isArray(weights) && weights.length < data.x.length) {
    let value = 1 / weights[0] ** 2;
    filler = () => value;
  }
  if (isArray(weights)) {
    filler = (i) => 1 / weights[i] ** 2;
  }
  let weightSquare = new Array(data.x.length);
  for (let i = 0; i < nbPoints; i++) {
    weightSquare[i] = filler(i);
  }
  let error = errorCalculation(
    data,
    parameters,
    parameterizedFunction,
    weightSquare,
  );

  let converged = error <= errorTolerance;

  let iteration = 0;
  for (; iteration < maxIterations && !converged; iteration++) {
    let previousError = error;

    let { perturbations, jacobianWeigthResidualError } = step(
      data,
      parameters,
      damping,
      gradientDifference,
      parameterizedFunction,
      centralDifference,
      weightSquare,
    );

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min(
        Math.max(minValues[k], parameters[k] - perturbations.get(k, 0)),
        maxValues[k],
      );
    }

    error = errorCalculation(
      data,
      parameters,
      parameterizedFunction,
      weightSquare,
    );

    if (isNaN(error)) break;

    let improvementMetric =
      (previousError - error) /
      perturbations
        .transpose()
        .mmul(perturbations.mulS(damping).add(jacobianWeigthResidualError))
        .get(0, 0);

    if (improvementMetric > improvementThreshold) {
      damping = Math.max(damping / dampingStepDown, 1e-7);
    } else {
      error = previousError;
      damping = Math.min(damping * dampingStepUp, 1e7);
    }

    converged = error <= errorTolerance;
  }

  return {
    parameterValues: parameters,
    parameterError: error,
    iterations: iteration,
  };
}
