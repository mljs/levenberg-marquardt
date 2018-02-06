import errorCalculation from '../errorCalculation';

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

describe('errorCalculation test', () => {
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

    expect(errorCalculation(data, [2, 2], sinFunction)).toBeCloseTo(0, 3);
    expect(errorCalculation(data, [4, 4], sinFunction)).toBeCloseTo(48.7, 1);
  });
});
