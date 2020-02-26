/**
 * Calculate current error
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} parameters - Array of current parameter values
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {number}
 */
export default function errorCalculation(
  data,
  parameters,
  parameterizedFunction,
) {
  let error = 0;
  const func = parameterizedFunction(parameters);

  for (let i = 0; i < data.x.length; i++) {
    error += Math.abs(data.y[i] - func(data.x[i]));
  }

  return error;
}
