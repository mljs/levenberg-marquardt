'use strict';

const levenbergMarquardt = require('..');

describe('levenberg-marquardt test', function () {

    it('Base example', function () {
        function sinFunction(a, b) {
            return (t) => (a * Math.sin(b * t));
        }

        const len = 20;
        let data = [new Array(len), new Array(len)];
        let sampleFunction = sinFunction(2, 2);
        for (let i = 0; i < len; i++) {
            data[0][i] = i;
            data[1][i] = sampleFunction(i);
        }
        const options = {
            damping: 0.1,
            initialValues: [1, 1]
        };

        let ans = levenbergMarquardt(data, sinFunction, options);
        ans.parameterValues[0].should.be.approximately(2, 10e-3);
        ans.parameterValues[1].should.be.approximately(2, 10e-3);
        ans.parameterError.should.be.approximately(0, 10e-3);
        ans.iterations.should.be.approximately(10, 10);
    });
});
