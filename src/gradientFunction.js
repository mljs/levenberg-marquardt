import { Matrix } from 'ml-matrix';
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

export function gradientFunction(
  data,
  evaluatedData,
  params,
  gradientDifference,
  paramFunction,
  centralDifference = false,
) {
  const nbParams = params.length;
  const nbPoints = data.x.length;
  // console.log(' gradientDiffe', gradientDifference)
  let ans = Matrix.zeros(nbParams, nbPoints);

  let columnIndex = -1;
  for (let param = 0; param < nbParams; param++) {
    if (gradientDifference[param] !== 0) columnIndex++;

    let delta = gradientDifference[param]; // * (1 + Math.abs(params[param]));
    let auxParams = params.slice();
    auxParams[param] += delta;
    let funcParam = paramFunction(auxParams);
    if (!centralDifference) {
      for (let point = 0; point < nbPoints; point++) {
        ans.set(
          columnIndex,
          point,
          (evaluatedData[point] - funcParam(data.x[point])) / delta,
        );
      }
    } else {
      delta *= 2;
      auxParams[param] -= delta;
      let funcParam2 = paramFunction(auxParams);
      for (let point = 0; point < nbPoints; point++) {
        ans.set(
          columnIndex,
          point,
          (funcParam(data.x[point]) - funcParam2(data.x[point])) / delta,
        );
      }
    }
  }
  // console.log(' gradient', ans.columns, ans.rows)
  return ans;
}
