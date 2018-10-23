import errorCalculation from '../errorCalculation';

describe('parameterError', () => {
  describe('Linear functions', () => {
    const linearFunction = ([slope, intercept]) => ((x) => slope * x + intercept);

    const sampleParameters = [1, 1];
    const n = 10;
    const xs = new Array(n).fill(0).map((zero, i) => i);
    const data = {
      x: xs,
      y: xs.map(linearFunction(sampleParameters))
    };

    it('parameterError should be zero for an exact fit', () => {
      expect(errorCalculation(data, sampleParameters, linearFunction)).toBeCloseTo(0, 3);
    });

    it('parameterError should match the sum of absolute difference between the model and the data', () => {
      const parameters = Array.from(sampleParameters);
      // Offset line so that it's still parallel but differs by 1 at each point
      // Then each point will result in a residual increase of 1
      parameters[1] += 1;
      expect(errorCalculation(data, parameters, linearFunction)).toBeCloseTo(n, 3);
    });
  });
});
