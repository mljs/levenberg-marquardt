'use strict';

const levenbergMarquardt = require('..');

describe('levenberg-marquardt test', function () {
    it('Base example', function () {
        const len = 20;
        let data = {
            x: new Array(len),
            y: new Array(len)
        };
        let sampleFunction = sinFunction([2, 2]);
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
        const options = {
            damping: 0.1,
            initialValues: [3, 3]
        };

        levenbergMarquardt.bind(null).should.throw('The damping option must be a positive number');
        levenbergMarquardt.bind(null, [1, 2], sinFunction, options)
            .should.throw('The data parameter must have x and y elements');
        levenbergMarquardt.bind(null, {x: 1, y: 2}, sinFunction, options)
            .should.throw('The data parameter elements must be an array with more than 2 points');
        levenbergMarquardt.bind(null, {x: [1, 2], y: [1, 2, 3]}, sinFunction, options)
            .should.throw('The data parameter elements must have the same size');
        levenbergMarquardt.bind(null, {x: [1, 2], y: [1, 2]}, sumOfLorentzians, {damping: 0.1})
            .should.throw('initialValues must be an array');
    });

    it('Sigmoid example', function () {
        const len = 20;
        let data = {
            x: new Array(len),
            y: new Array(len)
        };
        let sampleFunction = sigmoidFunction([2, 2, 2]);
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

    it('Sum of lorentzians example', function () {
        const len = 100;
        const pTrue = [1, 0.1, 0.3, 4, 0.15, 0.30];
        let data = {
            x: new Array(len),
            y: new Array(len)
        };

        let sampleFunction = sumOfLorentzians(pTrue);
        for (let i = 0; i < len; i++) {
            data.x[i] = i;
            data.y[i] = sampleFunction(i);
        }

        let ans = levenbergMarquardt(data, sumOfLorentzians, {
            damping: 0.01,
            initialValues: [1.1, 0.15, 0.29, 4.05, 0.17, 0.28],
            maxIterations: 500,
            errorTolerance: 10e-5});

        for (let i = 0; i < pTrue.length; i++) {
            ans.parameterValues[i].should.be.approximately(pTrue[i], 10e-2);
        }
        ans.iterations.should.be.belowOrEqual(500);
    });
});


function sinFunction([a, b]) {
    return (t) => (a * Math.sin(b * t));
}

function sigmoidFunction([a, b, c]) {
    return (t) => (a / (b + Math.exp(-t * c)));
}

function sumOfLorentzians(p) {
    return (t) => {
        var nL = p.length;
        var factor, p2;
        var result = 0;
        for (var i = 0; i < nL; i += 3) {
            p2 = Math.pow(p[i + 2] / 2, 2);
            factor = p[i + 1] * p2;
            result += factor / (Math.pow(t - p[i], 2) + p2);
        }
        return result;
    };
}
