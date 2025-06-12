import checkOptions from './check_options.js';
import errorCalculation from './error_calculation.js';
import step from './step.js';
import type {
  Data2D,
  LevenbergMarquardtOptions,
  LevenbergMarquardtReturn,
  ParameterizedFunction,
} from './types.js';

/**
 * Curve fitting algorithm
 * @param data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param parameterizedFunction - Takes an array of parameters and returns a function with the independent variable as its sole argument
 * @param options - Options object
 * @param options.initialValues - Array of initial parameter values
 * @param [options.weights = 1] - weighting vector, if the length does not match with the number of data points, the vector is reconstructed with first value.
 * @param [options.damping = 1e-2] - Levenberg-Marquardt parameter, small values of the damping parameter λ result in a Gauss-Newton update and large
 values of λ result in a gradient descent update
 * @param [options.dampingStepDown = 9] - factor to reduce the damping (Levenberg-Marquardt parameter) when there is not an improvement when updating parameters.
 * @param [options.dampingStepUp = 11] - factor to increase the damping (Levenberg-Marquardt parameter) when there is an improvement when updating parameters.
 * @param [options.improvementThreshold = 1e-3] - the threshold to define an improvement through an update of parameters
 * @param [options.gradientDifference = 10e-2] - The step size to approximate the jacobian matrix
 * @param [options.centralDifference = false] - If true the jacobian matrix is approximated by central differences otherwise by forward differences
 * @param [options.minValues] - Minimum allowed values for parameters
 * @param [options.maxValues] - Maximum allowed values for parameters
 * @param [options.maxIterations = 100] - Maximum of allowed iterations
 * @param [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point.
 * @param [options.timeout] - maximum time running before throw in seconds.
 */
export function levenbergMarquardt(
  data: Data2D,
  parameterizedFunction: ParameterizedFunction,
  options: LevenbergMarquardtOptions,
): LevenbergMarquardtReturn {
  const checkedOptions = checkOptions(data, options);
  const {
    checkTimeout,
    minValues,
    maxValues,
    parameters,
    weightSquare,
    dampingStepUp,
    dampingStepDown,
    maxIterations,
    errorTolerance,
    centralDifference,
    gradientDifference,
    improvementThreshold,
  } = checkedOptions;
  let damping = checkedOptions.damping;

  let error = errorCalculation(
    data,
    parameters,
    parameterizedFunction,
    weightSquare,
  );
  let optimalError = error;
  let optimalParameters = parameters.slice();

  let converged = error <= errorTolerance;

  let iteration = 0;
  for (; iteration < maxIterations && !converged; iteration++) {
    const previousError = error;

    const { perturbations, jacobianWeightResidualError } = step(
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

    if (error < optimalError - errorTolerance) {
      optimalError = error;
      optimalParameters = parameters.slice();
    }

    const improvementMetric =
      (previousError - error) /
      perturbations
        .transpose()
        .mmul(perturbations.mul(damping).add(jacobianWeightResidualError))
        .get(0, 0);

    if (improvementMetric > improvementThreshold) {
      damping = Math.max(damping / dampingStepDown, 1e-7);
    } else {
      damping = Math.min(damping * dampingStepUp, 1e7);
    }

    if (checkTimeout()) {
      throw new Error(
        `The execution time is over to ${options.timeout} seconds`,
      );
    }

    converged = error <= errorTolerance;
  }

  return {
    parameterValues: optimalParameters,
    parameterError: optimalError,
    iterations: iteration,
  };
}
