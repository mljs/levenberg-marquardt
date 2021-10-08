/**
 * the sum of the weighted squares of the errors (or weighted residuals) between the data.y
 * and the curve-fit function.
 * @ignore
 * @param {{x:ArrayLike<number>, y:ArrayLike<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {ArrayLike<number>} parameters - Array of current parameter values
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {ArrayLike<number>} weightSquare - Square of weights
 * @return {number}
 */
export default function errorCalculation(
  data,
  parameters,
  parameterizedFunction,
  weightSquare,
) {
  let error = 0;
  const func = parameterizedFunction(parameters);
  for (let i = 0; i < data.x.length; i++) {
    error += Math.pow(data.y[i] - func(data.x[i]), 2) / weightSquare[i];
  }

  return error;
}
