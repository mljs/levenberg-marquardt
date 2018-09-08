import nd from 'norm-dist';

/** @param {number} x */
const sq = x => x * x;

/** @param {...number} n */
const isNaN = (...n) => n.some( x => Number.isNaN(x) );


/**
 * Compute equiprobable ranges in normal distribution
 * @ignore
 * @param {number} iterations - How many evaluations (per point per step) of the fitted function to use to approximate the error propagation through it
 */
export function initializeErrorPropagation( iterations ) {
  if (equiprobableStops.length === iterations) return;

  const min = nd.cdf(-2.25);
  const max = 1 - min;
  const step = (max - min) / (iterations - 1);

  for (var i = 0, x = min; i < iterations; i++, x += step) {
    equiprobableStops[i] = nd.icdf(x);
  }
}

/** @type {number[]} */
const equiprobableStops = [];


/**
 * Estimate error propagation through a function
 * @ignore
 * @param {(x: number) => number} fn - The function to approximate, outside of the function domain return `NaN`
 * @param {number} x - The error propagation will be approximate in the neighbourhood of this point
 * @param {number} xSigma - The standard deviation of `x`
 * @return {number} The estimated standard deviation of `fn(x)`
 */
export function errorPropagation(
  fn,
  x,
  xSigma
) {
  const stopCount = equiprobableStops.length;

  var slope = 0;
  var N = 0;

  var xLast = x + xSigma * equiprobableStops[0];
  var yLast = fn(xLast);

  for (var stop = 1; stop < stopCount; stop++) {
    var xNew = x + xSigma * equiprobableStops[stop];
    var yNew = fn(xNew);

    if (!isNaN(xNew, yNew, xLast, yLast)) {
      slope += (yNew - yLast) / (xNew - xLast);
      N++;
    }

    xLast = xNew;
    yLast = yNew;
  }

  const avgSlope = slope / N;

  return Math.abs(avgSlope * xSigma);
}

/**
 * Approximate errors in point location and calculate point weights
 * @ignore
 * @param {{x:Array<number>, y:Array<number>, xError:Array<number>|void, yError:Array<number>|void}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of parameter values
 * @param {(n: number[]) => (x: number) => number} paramFunction - Takes the parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>} Array of point weights
 */
export function pointWeights(
  data,
  params,
  paramFunction
) {
  const m = data.x.length;

  /** @type {Array<number>} */
  const errs = new Array(m);

  if (!data.xError) {

    if (!data.yError) {
      return errs.fill(1);

    } else {
      errs.splice(0, m, ...data.yError);
    }

  } else {

    const fn = paramFunction(params);
    var point;

    for (point = 0; point < m; point++) {
      errs[point] = errorPropagation(fn, data.x[point], data.xError[point]);
    }

    if (data.yError) {
      for (point = 0; point < m; point++) {
        errs[point] = Math.sqrt( sq(errs[point]) + sq(data.yError[point]) );
      }
    }
  }

  // Point weight is the reciprocal of its error
  for (point = 0; point < m; point++) {
    errs[point] = 1 / errs[point];
  }

  return errs;
}

/**
 * Calculate the current sum of residuals
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} parameters - Array of current parameter values
 * @param {(...n: number[]) => (x: number) => number} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {number}
 */
export function sumOfResiduals(
  data,
  parameters,
  paramFunction
) {
  var error = 0;
  const func = paramFunction(parameters);

  for (var i = 0; i < data.x.length; i++) {
    error += Math.abs(data.y[i] - func(data.x[i]));
  }

  return error;
}

/**
 * Calculate the current sum of squares of residuals
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} parameters - Array of current parameter values
 * @param {(...n: number[]) => (x: number) => number} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {number}
 */
export function sumOfSquaredResiduals(
  data,
  parameters,
  paramFunction
) {
  var error = 0;
  const func = paramFunction(parameters);

  for (var i = 0; i < data.x.length; i++) {
    error += sq(data.y[i] - func(data.x[i]));
  }

  return error;
}
