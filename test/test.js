'use strict';

const levenbergMarquardt = require('..');

describe('levenberg-marquardt test', function () {

    it('Base example', function () {
        function sinFunction(a, b) {
            return (t) => (a * Math.sin(b * t));
        }

        const len = 20;
        let data = new Array(len);
        let sampleFunction = sinFunction(2, 2);
        for (let i = 0; i < len; i++) {
            data[i] = [i, sampleFunction(i)];
        }

        let params = levenbergMarquardt(data, [1, 1], 0.1, sinFunction);
        params[0].should.be.approximately(2, 10e-3);
        params[1].should.be.approximately(2, 10e-3);
    });
});
