import { CholeskyDecomposition, inverse, Matrix } from 'ml-matrix';

import gradientFunction from './gradient_function.ts';
import type {
  Data2D,
  JacobianFunction,
  ParameterizedFunction,
} from './types.ts';

/**
 * Builds the (nbParams x nbPoints) Jacobian of the residuals from an analytical
 * model gradient. The residual is `y - model`, so the residual Jacobian is the
 * negative of the model gradient — matching the sign convention produced by the
 * finite-difference `gradientFunction`.
 * @param data - points to fit
 * @param params - current parameter values
 * @param jacobianFunction - returns, for an x, the model partials over params
 */
function analyticalGradient(
  data: Data2D,
  params: number[],
  jacobianFunction: JacobianFunction,
): Matrix {
  const nbParams = params.length;
  const nbPoints = data.x.length;
  const ans = Matrix.zeros(nbParams, nbPoints);
  const gradient = jacobianFunction(params);
  for (let point = 0; point < nbPoints; point++) {
    const partials = gradient(data.x[point]);
    for (let param = 0; param < nbParams; param++) {
      ans.set(param, point, -partials[param]);
    }
  }
  return ans;
}

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
 * @param jacobianFunction - optional analytical Jacobian, replaces finite differences when provided
 */
export default function step(
  data: Data2D,
  params: number[],
  damping: number,
  gradientDifference: number[],
  parameterizedFunction: ParameterizedFunction,
  centralDifference: boolean,
  weights: ArrayLike<number>,
  jacobianFunction?: JacobianFunction,
) {
  const func = parameterizedFunction(params);

  const evaluatedData = new Float64Array(data.x.length);
  for (let i = 0; i < data.x.length; i++) {
    evaluatedData[i] = func(data.x[i]);
  }

  const gradientFunc = jacobianFunction
    ? analyticalGradient(data, params, jacobianFunction)
    : gradientFunction(
        data,
        evaluatedData,
        params,
        gradientDifference,
        parameterizedFunction,
        centralDifference,
      );
  const residualError = matrixFunction(data, evaluatedData);

  const hessianApproximation = gradientFunc.mmulByTranspose(weights);
  for (let i = 0; i < params.length; i++) {
    hessianApproximation.set(i, i, hessianApproximation.get(i, i) + damping);
  }
  const jacobianWeightResidualError = gradientFunc.mmul(
    residualError.scale('row', { scale: weights }),
  );

  // (damping * I + Jᵀ W J) is symmetric positive-definite for damping > 0, so a
  // Cholesky solve is faster and more numerically stable than forming the full
  // inverse and multiplying. Fall back to the inverse only in the rare case the
  // approximated Hessian is not positive-definite.
  const cholesky = new CholeskyDecomposition(hessianApproximation);
  const perturbations = cholesky.isPositiveDefinite()
    ? cholesky.solve(jacobianWeightResidualError)
    : inverse(hessianApproximation).mmul(jacobianWeightResidualError);

  return {
    perturbations,
    jacobianWeightResidualError,
  };
}
