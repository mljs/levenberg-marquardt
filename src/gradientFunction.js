import { Matrix } from 'ml-matrix';

/**
 * Difference of the matrix function over the parameters
 * @ignore
 * @param {{x:ArrayLike<number>, y:ArrayLike<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {ArrayLike<number>} evaluatedData - Array of previous evaluated function values
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number|array} gradientDifference - The step size to approximate the jacobian matrix
 * @param {boolean} centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
 * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
export default function gradientFunction(
  data,
  evaluatedData,
  params,
  gradientDifference,
  paramFunction,
  centralDifference,
) {
  const nbParams = params.length;
  const nbPoints = data.x.length;
  let ans = Matrix.zeros(nbParams, nbPoints);

  let rowIndex = 0;
  for (let param = 0; param < nbParams; param++) {
    if (gradientDifference[param] === 0) continue;
    let delta = gradientDifference[param];
    let auxParams = params.slice();
    auxParams[param] += delta;
    let funcParam = paramFunction(auxParams);
    if (!centralDifference) {
      for (let point = 0; point < nbPoints; point++) {
        ans.set(
          rowIndex,
          point,
          (evaluatedData[point] - funcParam(data.x[point])) / delta,
        );
      }
    } else {
      auxParams = params.slice();
      auxParams[param] -= delta;
      delta *= 2;
      let funcParam2 = paramFunction(auxParams);
      for (let point = 0; point < nbPoints; point++) {
        ans.set(
          rowIndex,
          point,
          (funcParam2(data.x[point]) - funcParam(data.x[point])) / delta,
        );
      }
    }
    rowIndex++;
  }

  return ans;
}
