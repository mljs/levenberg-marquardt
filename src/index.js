'use strict';

const errorCalculation = require('./errorCalculation');
const step = require('./step');
const checkArguments = require('./checkArguments');

const defaultOptions = {
    damping: undefined,
    gradientDifference: 10e-2,
    initialValues: undefined,
    maxIterations: 100,
    errorTolerance: 10e-3
};

/**
 * Curve fitting algorithm
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping = undefined] - Levenberg-Marquardt parameter
 * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.initialValues = undefined] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
 * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
 */
function levenbergMarquardt(data, parameterizedFunction, options) {

    options = Object.assign({}, defaultOptions, options);

    let msg = checkArguments(data, parameterizedFunction, options);

    if (msg !== '') {
        throw new RangeError(msg);
    }

    var parameters = options.initialValues ? options.initialValues : new Array(parameterizedFunction.length).fill(1);

    var error = errorCalculation(data, parameters, parameterizedFunction);

    var converged = error <= options.errorTolerance;

    for (var iteration = 0; (iteration < options.maxIterations) && !converged; iteration++) {
        parameters = step(data, parameters, options.damping, options.gradientDifference, parameterizedFunction);
        error = errorCalculation(data, parameters, parameterizedFunction);
        converged = error <= options.errorTolerance;
    }

    return {
        parameterValues: parameters,
        parameterError: error,
        iterations: iteration
    };
}

module.exports = levenbergMarquardt;
