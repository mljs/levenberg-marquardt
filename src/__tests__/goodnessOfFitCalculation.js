import goodnessOfFitCalculation from '../goodnessOfFitCalculation';

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

describe('goodnessOfFitCalculation test', () => {
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

    expect(goodnessOfFitCalculation(data, [2, 2], sinFunction)).toBeCloseTo(1, 3);
    expect(goodnessOfFitCalculation(data, [4, 4], sinFunction)).toBeCloseTo(0.5, 3);
  });
});
