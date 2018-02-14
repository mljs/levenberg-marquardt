/**
 * Calculate goodness Of Fit
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in
 * the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} parameters - Array of current parameter values
 * @param {function} parameterizedFunction - The parameters and returns a
 * function with the independent variable as a parameter
 * @return {number}
 */

export default function goodnessOfFitCalculation(data, parameters,
  parameterizedFunction) {

  var chiSquared = 0;
  const func = parameterizedFunction(parameters);

  // TODO: Write R2 rather than this
  for (var i = 0; i < data.x.length; i++) {
    var expectedValue = func(data.x[i]);
    // The weigth is assumed to be sqrt(value)
    var weigthSquared = data.y[i];
    if (weigthSquared === 0.0) {
      weigthSquared = 1.0;
    }
    chiSquared += (Math.abs(data.y[i] - expectedValue)) ^ 2 / weigthSquared;
  }
  return chiSquared;
}
