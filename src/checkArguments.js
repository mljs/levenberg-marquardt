'use strict';

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
module.exports = checkArguments;
