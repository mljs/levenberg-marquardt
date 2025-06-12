import { inverse, Matrix } from 'ml-matrix';

import gradientFunction from './gradient_function.js';
import type { Data2D, ParameterizedFunction } from './types.js';

/**
 * Matrix function over the samples
 *
 * @param data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param evaluatedData - Array of previous evaluated function values
 */
function matrixFunction(data: Data2D, evaluatedData: Float64Array): Matrix {
  const m = data.x.length;

  const ans = new Matrix(m, 1);

  for (let point = 0; point < m; point++) {
    ans.set(point, 0, data.y[point] - evaluatedData[point]);
  }
  return ans;
}

/**
 * Iteration for Levenberg-Marquardt
 *
 * @param data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param params - Array of previous parameter values
 * @param damping - Levenberg-Marquardt parameter
 * @param gradientDifference - The step size to approximate the jacobian matrix
 * @param centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
 * @param parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param weights - scale the gradient and residual error by weights
 */
export default function step(
  data: Data2D,
  params: number[],
  damping: number,
  gradientDifference: number[],
  parameterizedFunction: ParameterizedFunction,
  centralDifference: boolean,
  weights?: ArrayLike<number>,
) {
  const identity = Matrix.eye(params.length, params.length, damping);

  const func = parameterizedFunction(params);

  const evaluatedData = new Float64Array(data.x.length);
  for (let i = 0; i < data.x.length; i++) {
    evaluatedData[i] = func(data.x[i]);
  }

  const gradientFunc = gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    parameterizedFunction,
    centralDifference,
  );
  const residualError = matrixFunction(data, evaluatedData);

  const inverseMatrix = inverse(
    identity.add(
      gradientFunc.mmul(
        gradientFunc.transpose().scale('row', { scale: weights }),
      ),
    ),
  );

  const jacobianWeightResidualError = gradientFunc.mmul(
    residualError.scale('row', { scale: weights }),
  );

  const perturbations = inverseMatrix.mmul(jacobianWeightResidualError);

  return {
    perturbations,
    jacobianWeightResidualError,
  };
}
