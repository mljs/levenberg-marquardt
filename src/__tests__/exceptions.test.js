import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import { levenbergMarquardt } from '..';

expect.extend({ toBeDeepCloseTo });

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

describe('Handling of invalid arguments', () => {
  describe('options', () => {
    it('Should throw an error when bad options are provided (negative damping)', () => {
      // @ts-expect-error
      expect(() => levenbergMarquardt({}, () => 1, { damping: -1 })).toThrow(
        'The damping option must be a positive number',
      );
    });

    it('Should throw an error when initialValues is not an array', () => {
      expect(() =>
        levenbergMarquardt({ x: [1, 2], y: [1, 2] }, sinFunction, {
          damping: 0.1,
          // @ts-expect-error
          initialValues: 2,
        }),
      ).toThrow('initialValues must be an array');
    });

    it('Should throw an error when minValues and maxValues are not the same length', () => {
      expect(() =>
        levenbergMarquardt({ x: [1, 2], y: [1, 2] }, sinFunction, {
          damping: 0.1,
          minValues: [1, 2, 3],
          maxValues: [1, 2],
          initialValues: [1, 1],
        }),
      ).toThrow('minValues and maxValues must be the same size');
    });
  });

  describe('data', () => {
    const options = {
      damping: 0.1,
      initialValues: [3, 3],
    };

    it('Should throw an error when data is an array (should be object)', () => {
      // @ts-expect-error
      expect(() => levenbergMarquardt([1, 2], sinFunction, options)).toThrow(
        'The data parameter must have x and y elements',
      );
    });

    it('Should throw an error when data.{x,y} are numbers (should be arrays)', () => {
      expect(() =>
        // @ts-expect-error
        levenbergMarquardt({ x: 1, y: 2 }, sinFunction, options),
      ).toThrow(
        'The data parameter elements must be an array with more than 2 points',
      );
    });

    it('Should throw an error when data.{x,y} are not the same length', () => {
      expect(() =>
        levenbergMarquardt({ x: [1, 2], y: [1, 2, 3] }, sinFunction, options),
      ).toThrow('The data parameter elements must have the same size');
    });
  });
});

describe('Handling of ill-behaved functions', () => {
  function fourParamEq([a, b, c, d]) {
    return (t) => a + (b - a) / (1 + Math.pow(c, d) * Math.pow(t, -d));
  }

  const data = {
    x: [
      9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7,
      0.00000258, 0.0000155, 0.0000929,
    ],
    y: [
      7.807, -3.74, 21.119, 2.382, 4.269, 41.57, 73.401, 98.535, 97.059, 92.147,
    ],
  };
  it('Should stop and return initialValues if function evaluates to NaN after starting', () => {
    const options = {
      damping: 0.01,
      maxIterations: 200,
      initialValues: [0, 100, 1, 0.1],
      // Note: This test is identical to the other fourParamEq test, except for the
      // damping parameter. The increased damping option leads to a case where
      // c < 0 && d is not an integer so Math.pow(c, d) is NaN
    };

    const actual = levenbergMarquardt(data, fourParamEq, options);
    expect(actual).toBeDeepCloseTo(
      {
        iterations: 0,
        parameterError: 19289.706,
        parameterValues: [0, 100, 1, 0.1],
      },
      3,
    );
  });

  it('Should throw because execution time is over timeout', () => {
    const options = {
      timeout: 0,
      damping: 0.00001,
      maxIterations: 200,
      initialValues: [0, 100, 1, 0.1],
    };

    expect(() => levenbergMarquardt(data, fourParamEq, options)).toThrow(
      `The execution time is over to 0 seconds`,
    );
  });

  it('Should throw because is not a number', () => {
    const options = {
      timeout: 'a',
      damping: 0.00001,
      maxIterations: 200,
      initialValues: [0, 100, 1, 0.1],
    };

    // @ts-expect-error
    expect(() => levenbergMarquardt(data, fourParamEq, options)).toThrow(
      `timeout should be a number`,
    );
  });
});
