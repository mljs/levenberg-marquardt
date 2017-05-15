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
    // assign default values
    options = Object.assign({}, defaultOptions, options);

    let msg = checkArguments(data, parameterizedFunction, options);
    if (msg !== '') {
        throw new RangeError(msg);
    }
    // // fill with default value for initialValues
    // if (!options.initialValues) {
    //     var l = parameterizedFunction.length;
    //     options.initialValues = new Array(l);
    //     while (l--) {
    //         options.initialValues[l] = 1;
    //     }
    // }

    var parameters = options.initialValues ? options.initialValues : new Array(parameterizedFunction.length).fill(1);

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

function checkArguments(data, parameterizedFunction, options) {
    let msg = '';
    // verify that damping is not undefined
    if ((!options) || (!options.damping) || (options.damping <= 0)) {
        msg = 'The damping option should be a positive number';
    } else if (!data.x || !data.y) {
        msg = 'The data parameter should have a x and y elements';
    } else if ((data.x.constructor !== Array) || (data.x.length < 2) ||
        (data.y.constructor !== Array) || (data.y.length < 2)) {
        msg = 'The data parameter elements should be an array with more than 2 points';
    } else {
        let dataLen = data.x.length;
        let parameters = options.initialValues;
        if (dataLen !== data.y.length) {
            msg = 'The data parameter elements should have the same size';
        } else if (parameterizedFunction.length === 0) {
            if (parameters !== undefined && Array.isArray(parameters)) {
                let sampleFunction = parameterizedFunction(...parameters);
                if (isNaN(sampleFunction(1))) {
                    msg = 'The number of initialValues and parameters not match';
                }
            } else {
                msg = 'The initialValues is not an Array and parameters is cero';
            }
        } else if (parameters !== undefined && Array.isArray(parameters)) {
            if (parameters.length !== parameterizedFunction.length) {
                msg = 'The number of initialValues and parameters not match';
            }
        }
    }
    return msg;
}
module.exports = levenbergMarquardt;
