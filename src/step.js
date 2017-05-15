'use strict';

const Matrix = require('ml-matrix');

/**
 * Difference of the matrix function over the parameters
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
function gradientFunction(data, params, gradientDifference, paramFunction) {
    const n = params.length;
    const m = data.x.length;

    var ans = new Array(n);
    const func = paramFunction(...params);

    for (var param = 0; param < n; param++) {
        ans[param] = new Array(m);

        var auxParams = params.concat();
        auxParams[param] += gradientDifference;
        var funcParam = paramFunction(...auxParams);

        for (var point = 0; point < m; point++) {
            ans[param][point] = func(data.x[point]) - funcParam(data.x[point]);
        }
    }

    return new Matrix(ans);
}

/**
 * Matrix function over the samples
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Matrix}
 */
function matrixFunction(data, params, paramFunction) {
    const m = data.x.length;

    var ans = new Array(m);
    const func = paramFunction(...params);

    for (var point = 0; point < m; point++) {
        ans[point] = data.y[point] - func(data.x[point]);
    }

    return new Matrix([ans]);
}

/**
 * Iteration for Levenberg-Marquardt
 * @ignore
 * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
 * @param {Array<number>} params - Array of previous parameter values
 * @param {number} damping - Levenberg-Marquardt parameter
 * @param {number} gradientDifference - Adjustment for decrease the damping parameter
 * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
 * @return {Array<number>}
 */
function step(data, params, damping, gradientDifference, parameterizedFunction) {
    var identity = Matrix.eye(params.length)
        .mul(damping * gradientDifference * gradientDifference);
    var gradientFunc = gradientFunction(data, params, gradientDifference, parameterizedFunction);
    var matrixFunc = matrixFunction(data, params, parameterizedFunction).transpose();
    params = new Matrix([params]);

    var inverse = Matrix.inv(identity.add(gradientFunc.mmul(gradientFunc.transposeView())));
    params = params.sub(
        ((inverse.mmul(gradientFunc)).mmul(matrixFunc).mul(gradientDifference)).transposeView()
    );
    return params.to1DArray();
}

module.exports = step;
