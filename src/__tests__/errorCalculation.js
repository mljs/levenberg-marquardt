import errorCalculation from '../errorCalculation';

describe('parameterError', () => {
  describe('Sinusoidal functions', () => {
    function sinFunction([a, b]) {
      return (t) => a * Math.sin(b * t);
    }

    const sampleParameters = [2, 2];
    const n = 20;
    const xs = new Array(n).fill(0).map((zero, i) => i);
    const data = {
      x: xs,
      y: xs.map(sinFunction(sampleParameters))
    };

    it('parameterError should be zero for an exact fit', () => {
      expect(errorCalculation(data, sampleParameters, sinFunction)).toBeCloseTo(0, 3);
    });

    it('parameterError should be high for a bad fit', () => {
      expect(errorCalculation(data, [4, 4], sinFunction)).toBeCloseTo(48.7, 1);
    });
  });
});
