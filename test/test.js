'use strict';

const levenbergMarquardt = require('..');

describe('levenberg-marquardt test', function () {

    it('Base example', function () {
        function sinFunction(a, b) {
            return (t) => (a * Math.sin(b * t));
        }

        const len = 20;
        let data = {
            x: new Array(len),
            y: new Array(len)
        };
        let sampleFunction = sinFunction(2, 2);
        for (let i = 0; i < len; i++) {
            data.x[i] = i;
            data.y[i] = sampleFunction(i);
        }
        const options = {
            damping: 0.1,
            initialValues: [3, 3]
        };

        let ans = levenbergMarquardt(data, sinFunction, options);
        ans.parameterValues[0].should.be.approximately(2, 10e-3);
        ans.parameterValues[1].should.be.approximately(2, 10e-3);
        ans.parameterError.should.be.approximately(0, 10e-3);
        ans.iterations.should.be.approximately(10, 10);
    });

    it('Exceptions', function () {
        function sinFunction(a, b) {
            return (t) => (a * Math.sin(b * t));
        }

        const options = {
            damping: 0.1,
            initialValues: [3, 3]
        };

        levenbergMarquardt.bind(null).should.throw('The damping option should be a positive number');
        levenbergMarquardt.bind(null, [1, 2], sinFunction, options)
            .should.throw('The data parameter should have a x and y elements');
        levenbergMarquardt.bind(null, {x: 1, y: 2}, sinFunction, options)
            .should.throw('The data parameter elements should be an array with more than 2 points');
        levenbergMarquardt.bind(null, {x: [1, 2], y: [1, 2, 3]}, sinFunction, options)
            .should.throw('The data parameter elements should have the same size');
    });

    it('Sigmoid example', function () {
        function sigmoidFunction(a, b, c) {
            return (t) => (a / (b + Math.exp(-t * c)));
        }

        const len = 20;
        let data = {
            x: new Array(len),
            y: new Array(len)
        };
        let sampleFunction = sigmoidFunction(2, 2, 2);
        for (let i = 0; i < len; i++) {
            data.x[i] = i;
            data.y[i] = sampleFunction(i);
        }
        const options = {
            damping: 0.1,
            initialValues: [3, 3, 3],
            maxIterations: 200
        };

        let ans = levenbergMarquardt(data, sigmoidFunction, options);
        ans.parameterValues[0].should.be.approximately(2, 10e-2);
        ans.parameterValues[1].should.be.approximately(2, 10e-2);
        ans.parameterValues[2].should.be.approximately(2, 10e-2);
        ans.parameterError.should.be.approximately(0, 10e-2);
        ans.iterations.should.be.belowOrEqual(200);
    });
});
