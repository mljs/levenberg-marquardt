
/**
 * @typedef {Object} Options
 * @prop {number} [damping = 0.1] - Levenberg-Marquardt lambda parameter
 * @prop {number} [dampingDrop = 0.1] - The constant used to lower the damping parameter
 * @prop {number} [dampingBoost = 1.5] - The constant used to increase the damping parameter
 * @prop {number} [maxDamping] - Maximum value for the damping parameter
 * @prop {number} [minDamping] - Minimum value for the damping parameter
 * @prop {number} [gradientDifference = 1e-6] - The "infinitesimal" value used to approximate the gradient of the parameter space
 * @prop {Array<number>} [initialValues] - Array of initial parameter values
 * @prop {number} [maxIterations = 100] - Maximum of allowed iterations
 * @prop {number} [residualEpsilon = 1e-6] - Minimum change of the sum of residuals per step – if the sum of residuals changes less than this number, the algorithm will stop
 * @prop {Array<number>} [maxValues] - Maximum values for the parameters
 * @prop {Array<number>} [minValues] - Minimum values for the parameters
 * @prop {{rough: number, fine: number}} [errorPropagation] - How many evaluations (per point per step) of the fitted function to use to approximate the error propagation through it
 * @prop {number} [errorPropagation.rough = 10] - Number of iterations for rough estimation
 * @prop {number} [errorPropagation.fine = 50] - Number of iterations for fine estimation
 * @return {Result}
 */

/**
  * @typedef {Object} LegacyOptions
  * @prop {number} [errorTolerance] - The old name for `residualEpsilon`
  */

/**
 * @param {Options & LegacyOptions} legacy - The options object which can possibly contain deprecated values
 * @return {Options} The options object according to the current API
 */
export function compatOptions(legacy) {
  if (Object.prototype.hasOwnProperty.call(legacy, 'errorTolerance')) {
    legacy.residualEpsilon = legacy.errorTolerance;
  }
  return legacy;
}


/**
 * @typedef {Object} Result
 * @prop {Array<number>} parameterValues - The computed values of parameters
 * @prop {number} residuals - Sum of squared residuals of the final fit
 * @prop {number} iterations - Number of iterations used
 */

/**
 * @typedef {Object} LegacyResult
 * @property {number} parameterError - The old name for `residuals`
 */

/**
 * @param {Result} modern - The result according to the current API
 * @return {Result & LegacyResult} The result object augmented by the backwards-compatibility parameters
 */
export function compatReturn(modern) {
  return {
    ...modern,
    parameterError: modern.residuals
  };
}
