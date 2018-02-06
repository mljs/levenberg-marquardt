'use strict';

const errorCalculation = require('../src/errorCalculation');

describe('errorCalculation test', function () {

  it('Simple case', function () {
    function sinFunction([a, b]) {
      return (t) => (a * Math.sin(b * t));
    }

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

    errorCalculation(data, [2, 2], sinFunction).should.be.approximately(0, 10e-3);
    errorCalculation(data, [4, 4], sinFunction).should.not.be.approximately(0, 10e-3);
  });
});
