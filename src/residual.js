'use strict';

/**
 * Calculate the residuals
 * @ignore
 * @param {Array<number>} params - Array of parameter values
 * @param {Array<Array<number>>} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {number} errorTolerance - Minimum uncertainty allowed for each point
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>} - Array of residuals
 */
function residualCalculation(params, data, errorTolerance, parameterizedFunction) {
    let func = parameterizedFunction(...params);

    let residual = new Array(data[0].length);
    for (var i = 0; i < data[0].length; i++) {
        residual[i] = (data[1][i] - func(data[0][i])) / errorTolerance;
    }

    return residual;
}

module.exports = residualCalculation;
