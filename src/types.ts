export interface Data2D {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
}

/**
 * `params` comes from `LevenbergMarquardtOptions.initialValues`
 */
export type ParameterizedFunction = (params: number[]) => (x: number) => number;

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
   * maximum time running before throw in seconds.
   */
  timeout?: number;
}

export interface LevenbergMarquardtReturn {
  parameterValues: number[];
  parameterError: number;
  iterations: number;
}
