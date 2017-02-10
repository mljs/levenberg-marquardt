'use strict';

function errorCalculation(data, parameters, parameterizedFunction) {
    var error = 0;
    const func = parameterizedFunction(...parameters);

    for (var i = 0; i < data.x.length; i++) {
        error += Math.abs(data.y[i] - func(data.x[i]));
    }

    return error;
}

module.exports = errorCalculation;