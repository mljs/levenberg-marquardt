import { describe, expect, it } from 'vitest';

import { levenbergMarquardt } from '../index.ts';

function sinFunction([a, b]: number[]) {
  return (t: number) => a * Math.sin(b * t);
}

describe('Handling of invalid arguments', () => {
  describe('options', () => {
    it('Should throw an error when bad options are provided (negative damping)', () => {
      expect(() =>
        levenbergMarquardt({ x: [], y: [] }, () => () => 1, {
          damping: -1,
          initialValues: [],
        }),
      ).toThrow('The damping option must be a positive number');
    });

    it('Should throw an error when initialValues is not an array', () => {
      const expectedErrorMessage =
        'The initialValues option is mandatory and must be an array';
      const inputData = { x: [1, 2], y: [1, 2] };
      expect(() =>
        levenbergMarquardt(inputData, sinFunction, {
          damping: 0.1,
        } as never),
      ).toThrow(expectedErrorMessage);
      expect(() =>
        levenbergMarquardt(inputData, sinFunction, {
          damping: 0.1,
          initialValues: 2 as never,
        }),
      ).toThrow(expectedErrorMessage);
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

    it('Should throw an error when weights is not a number or an array', () => {
      expect(() => {
        levenbergMarquardt({ x: [0, 0, 0], y: [0, 0, 0] }, sinFunction, {
          initialValues: [0, 0, 0],
          weights: { length: 3 },
        });
      }).toThrow(
        'weights should be a number or array with length equal to the number of data points',
      );
    });

    it('Should throw an error when gradientDifference is not a number or an array', () => {
      expect(() => {
        levenbergMarquardt({ x: [0, 0, 0], y: [0, 0, 0] }, sinFunction, {
          initialValues: [0, 0, 0],
          gradientDifference: { length: 3 },
        });
      }).toThrow(
        'gradientDifference should be a number or array with length equal to the number of parameters',
      );
    });
  });

  describe('data', () => {
    const options = {
      damping: 0.1,
      initialValues: [3, 3],
    };

    it('Should throw an error when data is an array (should be object)', () => {
      expect(() =>
        levenbergMarquardt([1, 2] as never, sinFunction, options),
      ).toThrow('The data parameter must have x and y elements');
    });

    it('Should throw an error when data.{x,y} are numbers (should be arrays)', () => {
      expect(() =>
        levenbergMarquardt({ x: 1, y: 2 } as never, sinFunction, options),
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
  function fourParamEq([a, b, c, d]: number[]) {
    return (t: number) => a + (b - a) / (1 + c ** d * t ** -d);
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
      timeout: 'a' as never,
      damping: 0.00001,
      maxIterations: 200,
      initialValues: [0, 100, 1, 0.1],
    };

    expect(() => levenbergMarquardt(data, fourParamEq, options)).toThrow(
      `timeout should be a number`,
    );
  });
});
