'use strict';

module.exports = function checkArguments(data, parameterizedFunction, options) {
    let msg = '';
    if ((!options) || (!options.damping) || (options.damping <= 0)) {
        msg = 'The damping option must be a positive number';
    } else if (!data.x || !data.y) {
        msg = 'The data parameter must have x and y elements';
    } else if (!Array.isArray(data.x) || (data.x.length < 2) ||
               !Array.isArray(data.y) || (data.y.length < 2)) {
        msg = 'The data parameter elements must be an array with more than 2 points';
    } else {
        let dataLen = data.x.length;
        let parameters = options.initialValues;
        if (dataLen !== data.y.length) {
            msg = 'The data parameter elements must have the same size';
        } else if (parameterizedFunction.length === 0) {
            if (parameters !== undefined && Array.isArray(parameters)) {
                let sampleFunction = parameterizedFunction(...parameters);
                if (isNaN(sampleFunction(1))) {
                    msg = 'The number of initialValues and parameters do not match';
                }
            } else {
                msg = 'The initialValues is not an Array and parameters is zero';
            }
        } else if (parameters !== undefined && Array.isArray(parameters)) {
            if (parameters.length !== parameterizedFunction.length) {
                msg = 'The number of initialValues and parameters do not match';
            }
        }
    }
    return msg;
};
