export interface Data2D {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
}

/**
 * `params` comes from `LevenbergMarquardtOptions.initialValues`
 */
export type ParameterizedFunction = (params: number[]) => (x: number) => number;

/**
 * Optional analytical Jacobian.
 * Given the parameter vector, it returns a function that, for an x value,
 * yields the partial derivatives of the model with respect to every parameter
 * (an array of length `params.length`, in the same order as `params`).
 * When provided, it replaces the finite-difference approximation of the
 * Jacobian, which is both faster (no extra model evaluation per parameter)
 * and more accurate (so the optimizer usually needs fewer iterations).
 */
export type JacobianFunction = (params: number[]) => (x: number) => number[];

export interface LevenbergMarquardtOptions {
  /**
   * Array of initial parameter values
   */
  initialValues: ArrayLike<number>;
  /**
   * weighting vector, if the length does not match with the number of data points, the vector is reconstructed with first value.
   * @default 1
   */
  weights?: number | ArrayLike<number>;
  /**
   * Levenberg-Marquardt parameter, small values of the damping parameter
   * λ result in a Gauss-Newton update and large
   * values of λ result in a gradient descent update
   * @default 1e-2
   */
  damping?: number;
  /**
   * factor to reduce the damping (Levenberg-Marquardt parameter) when there is not an improvement when updating parameters.
   * @default 9
   */
  dampingStepDown?: number;
  /**
   * factor to increase the damping (Levenberg-Marquardt parameter) when there is an improvement when updating parameters.
   * @default 11
   */
  dampingStepUp?: number;
  /**
   * the threshold to define an improvement through an update of parameters
   * @default 1e-3
   */
  improvementThreshold?: number;
  /**
   * The step size to approximate the jacobian matrix
   * @default 10e-2
   */
  gradientDifference?: number | ArrayLike<number>;
  /**
   * If true the jacobian matrix is approximated by central differences otherwise by forward differences
   * @default false
   */
  centralDifference?: boolean;
  /**
   * Minimum allowed values for parameters
   */
  minValues?: ArrayLike<number>;
  /**
   * Maximum allowed values for parameters
   */
  maxValues?: ArrayLike<number>;
  /**
   * Maximum of allowed iterations
   * @default 100
   */
  maxIterations?: number;
  /**
   * Minimum uncertainty allowed for each point.
   * @default 10e-3
   */
  errorTolerance?: number;
  /**
   * Stop as soon as an iteration moves the parameters by less than this fraction
   * of their own magnitude.
   *
   * `errorTolerance` compares the *sum* of the squared residuals, so it grows
   * with the number of points: a large dataset that is fitted as well as double
   * precision allows can still sit above the threshold and keep iterating until
   * `maxIterations` while the parameters no longer move at all.
   *
   * Stopping there returns the same result as running on, because a negligible
   * step leaves the error unchanged, which makes the damping grow, which makes
   * every later step smaller still — the search cannot recover on its own.
   *
   * Set it to `0` to disable this criterion and always iterate until either
   * `errorTolerance` is reached or `maxIterations` is exhausted.
   * @default 1e-12
   */
  relativeStepTolerance?: number;
  /**
   * maximum time running before throw in seconds.
   */
  timeout?: number;
  /**
   * Analytical Jacobian of the model. When provided, the Jacobian is computed
   * exactly instead of being approximated by finite differences, which avoids
   * the extra model evaluations per parameter and usually converges in fewer
   * iterations. `centralDifference` and `gradientDifference` are ignored when
   * this option is set.
   */
  jacobianFunction?: JacobianFunction;
}

export interface LevenbergMarquardtReturn {
  parameterValues: number[];
  parameterError: number;
  iterations: number;
}
