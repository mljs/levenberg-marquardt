import errorCalculation from '../errorCalculation';

describe('parameterError', () => {
  describe('Sinusoidal functions', () => {
    function sinFunction([a, b]) {
      return (t) => a * Math.sin(b * t);
    }

    const sampleParameters = [2, 2];
    const n = 50;
    const xs = new Array(n).fill(0).map((zero, i) => i);
    const data = {
      x: xs,
      y: xs.map(sinFunction(sampleParameters))
    };

    it('parameterError should be zero for an exact fit', () => {
      expect(errorCalculation(data, sampleParameters, sinFunction)).toBeCloseTo(0, 3);
    });

    it('parameterError should match the sum of absolute difference between the model and the data', () => {
      const parameters = Array.from(sampleParameters);
      // Flip waveform about x-axis (equivalent to shifting phase half of a period)
      parameters[0] = -parameters[0];
      // This symmetry causes the residual at each x to be twice y
      const twiceSumOfAbsYs = 2 * data.y.reduce((sum, yi) => sum + Math.abs(yi), 0);
      expect(errorCalculation(data, parameters, sinFunction)).toBeCloseTo(twiceSumOfAbsYs, 3);
    });
  });
});
