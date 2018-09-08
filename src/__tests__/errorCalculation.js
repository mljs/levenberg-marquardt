import * as errCalc from '../errorCalculation';

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

describe('sum of residuals', () => {
  it('Simple case', () => {
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

    expect(errCalc.sumOfResiduals(data, [2, 2], sinFunction)).toBeCloseTo(0, 5);
    expect(errCalc.sumOfResiduals(data, [4, 4], sinFunction)).toBeCloseTo(48.7, 1);

    expect(errCalc.sumOfSquaredResiduals(data, [2, 2], sinFunction)).toBeCloseTo(0, 5);
    expect(errCalc.sumOfSquaredResiduals(data, [4, 4], sinFunction)).toBeCloseTo(165.6, 1);
  });
});

describe('error propagation estimator', () => {
  it('Simple case', () => {
    const q = Math.PI / 2;

    errCalc.initializeErrorPropagation(10);
    expect(errCalc.errorPropagation(sinFunction([4, 4]), 0, 0.001)).toBeCloseTo(0.016, 5);
    expect(errCalc.errorPropagation(sinFunction([1, 1]), q, 0.010)).toBeCloseTo(0.000, 5);

    errCalc.initializeErrorPropagation(50);
    expect(errCalc.errorPropagation(sinFunction([4, 4]), 0, 0.25)).toBeCloseTo(2.568135, 1);

    errCalc.initializeErrorPropagation(100);
    expect(errCalc.errorPropagation(sinFunction([4, 4]), 0, 0.25)).toBeCloseTo(2.568135, 2);

    errCalc.initializeErrorPropagation(1000);
    expect(errCalc.errorPropagation(sinFunction([4, 4]), 0, 0.25)).toBeCloseTo(2.568135, 4);

    errCalc.initializeErrorPropagation(10000);
    expect(errCalc.errorPropagation(sinFunction([4, 4]), 0, 0.25)).toBeCloseTo(2.568135, 6);
  });
});
