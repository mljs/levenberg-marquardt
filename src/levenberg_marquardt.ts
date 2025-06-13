import checkOptions from './check_options.ts';
import errorCalculation from './error_calculation.ts';
import step from './step.ts';
import type {
  Data2D,
  LevenbergMarquardtOptions,
  LevenbergMarquardtReturn,
  ParameterizedFunction,
} from './types.ts';

/**
 * Curve fitting algorithm
 * @param data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param parameterizedFunction - Takes an array of parameters and returns a function with the independent variable as its sole argument
 * @param options - Options object
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
