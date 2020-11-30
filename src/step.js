import { inverse, Matrix } from 'ml-matrix';

import { gradientFunction } from './gradientFunction';

/**
 * Matrix function over the samples
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @return {Matrix}
 */
function matrixFunction(data, evaluatedData) {
  const m = data.x.length;

  let ans = new Matrix(m, 1);

  for (let point = 0; point < m; point++) {
    ans.set(point, 0, data.y[point] - evaluatedData[point]);
  }
  return ans;
}

/**
 * Iteration for Levenberg-Marquardt
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} damping - Levenberg-Marquardt parameter
 * @param {number|array} gradientDifference - The step size to approximate the jacobian matrix
 * @param {boolean} centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>}
 */
export default function step(
  data,
  params,
  damping,
  gradientDifference,
  parameterizedFunction,
  centralDifference,
  weights,
) {
  let value = damping; // * gradientDifference[0] * gradientDifference[0];
  let identity = Matrix.eye(params.length, params.length, value);

  const func = parameterizedFunction(params);

  let evaluatedData = new Float64Array(data.x.length);
  for (let i = 0; i < data.x.length; i++) {
    evaluatedData[i] = func(data.x[i]);
  }

  let gradientFunc = gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    parameterizedFunction,
    centralDifference,
  );

  let residualError = matrixFunction(data, evaluatedData);
  // console.log(' identityt' , identity)
  // console.log(' gradient 2', identity.add(gradientFunc.mmul(gradientFunc.transpose())));
  let inverseMatrix = inverse(
    identity.add(gradientFunc.mmul(gradientFunc.transpose().scaleByRow(weights))), //poner weights como 1/w para que funcione esto
  );

  let residualErrorWeighted = residualError.scaleByRow(weights);
  // console.log(
  //   inverseMatrix
  //   .mmul(gradientFunc)
  //   .mmul(residualError)
  //   .transpose()
  // );
  return inverseMatrix
    .mmul(gradientFunc)
    .mmul(residualErrorWeighted)
    .to1DArray();
}
