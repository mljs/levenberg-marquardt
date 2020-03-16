import { inverse, Matrix } from 'ml-matrix';

/**
 * Difference of the matrix function over the parameters
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
function gradientFunction(
  data,
  evaluatedData,
  params,
  gradientDifference,
  paramFunction,
) {
  const n = params.length;
  const m = data.x.length;

  let ans = new Array(n);

  for (let param = 0; param < n; param++) {
    ans[param] = new Array(m);
    let auxParams = params.slice();
    auxParams[param] += gradientDifference;
    let funcParam = paramFunction(auxParams);

    for (let point = 0; point < m; point++) {
      ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
    }
  }
  return new Matrix(ans);
}

/**
 * Matrix function over the samples
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @return {Matrix}
 */
function matrixFunction(data, evaluatedData) {
  const m = data.x.length;

  let ans = new Array(m);

  for (let point = 0; point < m; point++) {
    ans[point] = [data.y[point] - evaluatedData[point]];
  }

  return new Matrix(ans);
}

/**
 * Iteration for Levenberg-Marquardt
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} damping - Levenberg-Marquardt parameter
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>}
 */
export default function step(
  data,
  params,
  damping,
  gradientDifference,
  parameterizedFunction,
) {
  let value = damping * gradientDifference * gradientDifference;
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
  );
  let matrixFunc = matrixFunction(data, evaluatedData);
  let inverseMatrix = inverse(
    identity.add(gradientFunc.mmul(gradientFunc.transpose())),
  );

  params = new Matrix([params]);
  params = params.sub(
    inverseMatrix
      .mmul(gradientFunc)
      .mmul(matrixFunc)
      .mul(gradientDifference)
      .transpose(),
  );

  return params.to1DArray();
}
