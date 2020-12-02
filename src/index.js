import checkOptions from './checkOptions';
import errorCalculation from './errorCalculation';
import step from './step';

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number|array} [options.weights = 1] - weighting vector, if the length does not match with the number of data points, the vector is reconstructed with first value.
 * @param {number} [options.damping = 1e-2] - Levenberg-Marquardt parameter, small values of the damping parameter λ result in a Gauss-Newton update and large
values of λ result in a gradient descent update
 * @param {number} [options.dampingStepDown = 9] - factor to reduce the damping (Levenberg-Marquardt parameter) when there is not an improvement when updating parameters.
 * @param {number} [options.dampingStepUp = 11] - factor to increase the damping (Levenberg-Marquardt parameter) when there is an improvement when updating parameters.
 * @param {number} [options.improvementThreshold = 1e-3] - the threshold to define an improvement through an update of parameters
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
    minValues,
    maxValues,
    parameters,
    weightSquare,
    damping,
    dampingStepUp,
    dampingStepDown,
    maxIterations,
    errorTolerance,
    centralDifference,
    gradientDifference,
    improvementThreshold,
  } = checkOptions(data, parameterizedFunction, options);

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

    for (let k = 0; k < parameters.length; k++) {
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
