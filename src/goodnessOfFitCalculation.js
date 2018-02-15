/**
 * Calculate goodness Of Fit
 * Inspired by: https://onlinecourses.science.psu.edu/stat501/node/255
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

  var goodnessOfFit = 0;
  const func = parameterizedFunction(parameters);

  var n = data.x.length;

  var average = 0;
  for (var i = 0; i < n; i++) {
    var expectedValue = func(data.x[i]);
    var observedValue = data.y[i];
    average += Math.abs(expectedValue - observedValue);
  }
  average = observedValue / n;

  var ssr = 0;
  var ssto = 0;
  for (i = 0; i < n; i++) {
    expectedValue = func(data.x[i]);
    observedValue = data.y[i];
    ssr += (Math.abs(expectedValue - average)) ^ 2;
    ssto += (Math.abs(observedValue - average)) ^ 2;
  }
  goodnessOfFit = ssr / ssto;

  return goodnessOfFit;
}
