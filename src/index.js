'use strict';

const errorCalculation = require('./errorCalculation');
const step = require('./step');

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
    // verify that damping is not undefined
    if ((!options.damping) || (options.damping <= 0)) {
        throw new TypeError('The damping option should be a positive number');
    }

    // assign default values
    options = Object.assign({}, defaultOptions, options);

    // fill with default value for initialValues
    if (!options.initialValues) {
        options.initialValues = new Array(parameterizedFunction.length);

        for (var i = 0; i < parameterizedFunction.length; i++) {
            options.initialValues[i] = 1;
        }
    }

    // check that the data has the correct format
    if (!data.x || !data.y) {
        throw new TypeError('The data parameter should have a x and y elements');
    } else if ((data.x.constructor !== Array) || (data.x.length < 2) ||
               (data.y.constructor !== Array) || (data.y.length < 2)) {
        throw new TypeError('The data parameter elements should be an array with more than 2 points');
    }

    const dataLen = data.x.length;
    if (dataLen !== data.y.length) {
        throw new RangeError('The data parameter elements should have the same size');
    }

    // initial parameters
    var parameters = options.initialValues;

    // check errorCalculation
    var error = errorCalculation(data, parameters, parameterizedFunction);
    var converged = error <= options.errorTolerance;

    for (var iteration = 0; (iteration < options.maxIterations) && !converged; iteration++) {
        // step function
        parameters = step(data, parameters, options.damping, options.gradientDifference, parameterizedFunction);

        // reevaluate errorCalculation
        error = errorCalculation(data, parameters, parameterizedFunction);
        converged = error <= options.errorTolerance;
    }


    // return example
    return {
        parameterValues: parameters,
        parameterError: error,
        iterations: iteration
    };
}

module.exports = levenbergMarquardt;
