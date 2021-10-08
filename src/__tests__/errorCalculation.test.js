import errorCalculation from '../errorCalculation';

describe('parameterError', () => {
  describe('Linear functions', () => {
    function linearFunction([slope, intercept]) {
      return (x) => slope * x + intercept;
    }

    /** @type [number, number] */
    const sampleParameters = [1, 1];
    const n = 10;
    const w = new Float64Array(n).fill(1);
    const xs = new Array(n).fill(0).map((zero, i) => i);
    const data = {
      x: xs,
      y: xs.map(linearFunction(sampleParameters)),
    };

    it('parameterError should be zero for an exact fit', () => {
      expect(
        errorCalculation(data, sampleParameters, linearFunction, w),
      ).toBeCloseTo(0, 3);
    });

    it('parameterError should match the sum of absolute difference between the model and the data', () => {
      const parameters = Array.from(sampleParameters);
      // Offset line so that it's still parallel but differs by 1 at each point
      // Then each point will result in a residual increase of 1
      parameters[1] += 1;
      expect(errorCalculation(data, parameters, linearFunction, w)).toBeCloseTo(
        n,
        3,
      );
    });
  });

  describe('Linear functions with typed array', () => {
    function linearFunction([slope, intercept]) {
      return (x) => slope * x + intercept;
    }

    /** @type [number, number] */
    const sampleParameters = [1, 1];
    const n = 10;
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    const w = new Float64Array(n);
    const fct = linearFunction(sampleParameters);
    for (let i = 0; i < n; i++) {
      x[i] = i;
      w[i] = 1;
      y[i] = fct(i);
    }

    it('parameterError should be zero for an exact fit', () => {
      expect(
        errorCalculation({ x, y }, sampleParameters, linearFunction, w),
      ).toBeCloseTo(0, 3);
    });

    it('parameterError should match the sum of absolute difference between the model and the data', () => {
      const parameters = Array.from(sampleParameters);
      // Offset line so that it's still parallel but differs by 1 at each point
      // Then each point will result in a residual increase of 1
      parameters[1] += 1;
      expect(
        errorCalculation({ x, y }, parameters, linearFunction, w),
      ).toBeCloseTo(n, 3);
    });
  });
});
