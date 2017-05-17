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
        }
        if (!Array.isArray(parameters)) {
            throw new Error('initialValues must be an array');
        }
    }
    return msg;
};
