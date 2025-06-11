import { Matrix } from 'ml-matrix';

/**
 * Difference of the matrix function over the parameters
 * @param data Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param evaluatedData - Array of previous evaluated function values
 * @param params - Array of previous parameter values
 * @param gradientDifference - The step size to approximate the jacobian matrix
 * @param centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
 * @param paramFunction - The parameters and returns a function with the independent variable as a parameter
 */
export default function gradientFunction(
  data: { x: ArrayLike<number>; y: ArrayLike<number> },
  evaluatedData: ArrayLike<number>,
  params: number[],
  gradientDifference: number[],
  paramFunction: (params: number[]) => (x: number) => number,
  centralDifference: boolean,
): Matrix {
  const nbParams = params.length;
  const nbPoints = data.x.length;
  const ans = Matrix.zeros(nbParams, nbPoints);

  let rowIndex = 0;
  for (let param = 0; param < nbParams; param++) {
    if (gradientDifference[param] === 0) continue;
    let delta = gradientDifference[param];
    let auxParams = params.slice();
    auxParams[param] += delta;
    const funcParam = paramFunction(auxParams);
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
      const funcParam2 = paramFunction(auxParams);
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
