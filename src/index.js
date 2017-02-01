'use strict';

const defaultOptions = {
    dampingIncrease: 10e-2,
    dampingDecrease: 10e-2,
    maxIterations: 100,
    errorTolerance: 10e-3
};

function levenbergMarquardt(data, initialValues, damping, parameterizedFunction, options) {
    options = Object.assign({}, defaultOptions, options);

    // check that the data has the correct format
    if ((!Array.isArray(data)) || (data.length !== 2)) {
        throw new TypeError('The data parameter should be an array of size 2');
    } else if ((!Array.isArray(data[0])) || (data[0].length < 2)
        || (!Array.isArray(data[1])) || (data[1].length < 2)) {
        throw new TypeError('The data parameter elements should be an array with more than 2 points');
    }

    const dataLen = data[0].length;
    if (dataLen !== data[1].length) {
        throw new RangeError('The data parameter elements should have the same size');
    }
}

module.exports = levenbergMarquardt;
