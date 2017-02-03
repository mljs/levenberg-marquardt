'use strict';

const residualCalculation = require('./residual');
const jacobianCalculation = require('./jacobian');

const defaultOptions = {
    damping: undefined,
    dampingIncrease: 10,
    dampingDecrease: 10,
    initialValues: undefined,
    maxIterations: 100,
    errorTolerance: 10e-3
};

/**
 * Curve fitting algorithm
 * @param {Array<Array<number>>} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @param {object} [options] - Options object
 * @param {number} [options.damping = undefined] - Levenberg-Marquardt parameter
 * @param {number} [options.dampingIncrease = 10] - Adjustment for increase the damping parameter
 * @param {number} [options.dampingDecrease = 10] - Adjustment for decrease the damping parameter
 * @param {Array<number>} [options.initialValues = undefined] - Array of initial parameter values
 * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
 * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
 * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
 */
function levenbergMarquardt(data, parameterizedFunction, options) {
    // verify that damping is not undefined
    if ((!options.damping) || (!Number.isInteger(options.damping)) ||(options.damping <= 0)) {
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
    if ((data.constructor !== Array) || (data.length !== 2)) {
        throw new TypeError('The data parameter should be an array of size 2');
    } else if ((data[0].constructor !== Array) || (data[0].length < 2) ||
               (data[1].constructor !== Array) || (data[1].length < 2)) {
        throw new TypeError('The data parameter elements should be an array with more than 2 points');
    }

    const dataLen = data[0].length;
    if (dataLen !== data[1].length) {
        throw new RangeError('The data parameter elements should have the same size');
    }

    // initial evaluations
    let residuals = residualCalculation();
    let jacobian = jacobianCalculation();

    // return example
    return {
        parameterValues: [1, 2],
        parameterError: 0,
        iterations: 10
    };
}

module.exports = levenbergMarquardt;
