import type { Data2D, ParameterizedFunction } from './types.ts';

/**
 * the sum of the weighted squares of the errors (or weighted residuals) between the data.y
 * and the curve-fit function.
 *
 * @param data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param parameters - Array of current parameter values
 * @param parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param weightSquare - Square of weights (must be same length as data.x)
 */
export default function errorCalculation(
  data: Data2D,
  parameters: number[],
  parameterizedFunction: ParameterizedFunction,
  weightSquare: number[],
): number {
  let error = 0;
  const func = parameterizedFunction(parameters);
  for (let i = 0; i < data.x.length; i++) {
    error += (data.y[i] - func(data.x[i])) ** 2 / weightSquare[i];
  }

  return error;
}
