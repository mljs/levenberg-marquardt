'use strict';

const Matrix = require('ml-matrix');

function gradientFunction(data, params, gradientDifference, paramFunction) {
    const n = paramFunction.length;
    const m = data.x.length;

    var ans = new Array(n);
    const func = paramFunction(...params);

    for (var param = 0; param < n; param++) {
        ans[param] = new Array(m);

        var auxParams = params.concat();
        auxParams[param] += gradientDifference;
        var funcParam = paramFunction(...auxParams);

        for (var point  = 0; point < m; point++) {
            ans[param][point] = func(data.x[point]) - funcParam(data.x[point]);
        }
    }

    return new Matrix(ans);
}

function matrixFunction(data, params, paramFunction) {
    const m = data.x.length;

    var ans = new Array(m);
    const func = paramFunction(...params);

    for (var point  = 0; point < m; point++) {
        ans[point] = data.y[point] - func(data.x[point]);
    }

    return new Matrix([ans]);
}

function step(data, params, damping, gradientDifference, parameterizedFunction) {
    var identity = Matrix.eye(parameterizedFunction.length)
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
