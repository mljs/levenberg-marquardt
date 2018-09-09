import { inverse, Matrix } from 'ml-matrix';
import { pointWeights } from './errorCalculation';

/**
 * Difference of the matrix function over the parameters
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} evaluatedData - Array of previous evaluated function values
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {(n: number[]) => (x: number) => number} paramFunction - Takes the parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
function gradientFunction(
  data,
  evaluatedData,
  params,
  gradientDifference,
  paramFunction
) {
  const n = params.length;
  const m = data.x.length;

  const weights = pointWeights(data, params, paramFunction);

  /** @type Array<Array<number>> */
  var ans = new Array(n);

  for (var param = 0; param < n; param++) {
    ans[param] = new Array(m);
    var auxParams = params.concat();
    auxParams[param] += gradientDifference;
    var funcParam = paramFunction(auxParams);

    for (var point = 0; point < m; point++) {
      ans[param][point] = ( evaluatedData[point] - funcParam(data.x[point]) ) * weights[point];
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

  /** @type Array<number> */
  var ans = new Array(m);

  for (var point = 0; point < m; point++) {
    ans[point] = [data.y[point] - evaluatedData[point]];
  }

  return new Matrix(ans);
}

/**
 * Iteration for Levenberg-Marquardt
 * @ignore
 * @param {{x:Array<number>, y:Array<number>, xError:Array<number>|void, yError:Array<number>|void}} data
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} damping - Levenberg-Marquardt parameter
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {(n: number[]) => (x: number) => number} paramFunction - Takes the parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>}
 */
export default function step(
  data,
  params,
  damping,
  gradientDifference,
  paramFunction
) {
  var scaledDamping = damping * gradientDifference * gradientDifference;
  var identity = Matrix.eye(params.length, params.length, scaledDamping);

  const func = paramFunction(params);
  var evaluatedData = data.x.map((e) => func(e));

  var gradient = gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    paramFunction
  );
  var residuals = matrixFunction(data, evaluatedData);
  var inverseMatrix = inverse(
    identity.add(gradient.mmul(gradient.transpose()))
  );

  let params2 = new Matrix([params]);
  params2 = params2.sub(
    inverseMatrix
      .mmul(gradient)
      .mmul(residuals)
      .mul(gradientDifference)
      .transpose()
  );

  return params2.to1DArray();
}
