/* eslint-disable jest/no-standalone-expect */
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { levenbergMarquardt } from '..';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

describe('curve', () => {
  describe('Contrived problems (clean data)', () => {
    // In these cases we test the algorithm's ability to find an , we use some pre-selected values and generate the data set and see if the algorithm can get close the the exact solution
    /** @type {any} */
    const contrivedProblems = [
      {
        name: 'bennet5([2, 3, 5])',
        getFunctionFromParameters([b1, b2, b3]) {
          return (t) => b1 * Math.pow(t + b2, -1 / b3);
        },
        n: 154,
        xStart: -2.6581,
        xEnd: 49.6526,
        problemParameters: [2, 3, 5],
        options: {
          damping: 0.00001,
          maxIterations: 1000,
          errorTolerance: 1e-7,
          maxValues: [11, 11, 11],
          minValues: [1, 2.7, 1],
          initialValues: [3.5, 3.8, 4],
        },
      },
      {
        name: '2*sin(2*t)',
        getFunctionFromParameters: sinFunction,
        n: 20,
        xStart: 0,
        xEnd: 19,
        problemParameters: [2, 2],
        options: {
          maxIterations: 100,
          gradientDifference: 10e-2,
          damping: 0.1,
          dampingStepDown: 1,
          dampingStepUp: 1,
          initialValues: [3, 3],
        },
      },
      {
        name: 'Sigmoid',
        getFunctionFromParameters([a, b, c]) {
          return (t) => a / (b + Math.exp(-t * c));
        },
        n: 20,
        xStart: 0,
        xEnd: 19,
        problemParameters: [2, 2, 2],
        options: {
          damping: 0.1,
          initialValues: [3, 3, 3],
          maxIterations: 200,
        },
        decimalsForParameterValues: 1,
      },
      {
        name: 'Sum of lorentzians',
        getFunctionFromParameters: function sumOfLorentzians(p) {
          return (t) => {
            let nL = p.length;
            let factor, p2;
            let result = 0;
            for (let i = 0; i < nL; i += 3) {
              p2 = Math.pow(p[i + 2] / 2, 2);
              factor = p[i + 1] * p2;
              result += factor / (Math.pow(t - p[i], 2) + p2);
            }
            return result;
          };
        },
        n: 100,
        xStart: 0,
        xEnd: 99,
        problemParameters: [1.05, 0.1, 0.3, 4, 0.15, 0.3],
        options: {
          damping: 0.01,
          gradientDifference: [0.01, 0.0001, 0.0001, 0.01, 0.0001, 0],
          initialValues: [1.1, 0.15, 0.29, 4.05, 0.17, 0.3],
          maxIterations: 500,
        },
        decimalsForParameterValues: 1,
      },
      {
        name: 'Sum of lorentzians, central differences',
        getFunctionFromParameters: function sumOfLorentzians(p) {
          return (t) => {
            let nL = p.length;
            let factor, p2;
            let result = 0;
            for (let i = 0; i < nL; i += 3) {
              p2 = Math.pow(p[i + 2] / 2, 2);
              factor = p[i + 1] * p2;
              result += factor / (Math.pow(t - p[i], 2) + p2);
            }
            return result;
          };
        },
        n: 100,
        xStart: 0,
        xEnd: 99,
        problemParameters: [1, 0.1, 0.3, 4, 0.15, 0.3],
        options: {
          damping: 0.01,
          gradientDifference: [0.01, 0.0001, 0.0001, 0.01, 0.0001],
          centralDifference: true,
          initialValues: [1.1, 0.15, 0.29, 4.05, 0.17, 0.28],
          maxIterations: 500,
          errorTolerance: 10e-8,
        },
        decimalsForParameterValues: 1,
      },
    ];

    contrivedProblems.forEach((problem) => {
      const testInvocation = problem.skip ? it.skip.bind(it) : it;
      testInvocation(`Should fit ${problem.name}`, () => {
        const {
          getFunctionFromParameters,
          n,
          xStart,
          xEnd,
          problemParameters,
          options,
          decimalsForParameterError,
          decimalsForParameterValues,
        } = Object.assign(
          {
            decimalsForParameterError: 2,
            decimalsForParameterValues: 3,
          },
          problem,
        );
        const xs = new Array(n)
          .fill(0)
          .map((zero, i) => xStart + (i * (xEnd - xStart)) / (n - 1));
        const data = {
          x: xs,
          y: xs.map(getFunctionFromParameters(problemParameters)),
        };

        const actual = levenbergMarquardt(
          data,
          getFunctionFromParameters,
          options,
        );
        expect(actual.parameterValues).toBeDeepCloseTo(
          problemParameters,
          decimalsForParameterValues,
        );
        expect(actual.parameterError).toBeDeepCloseTo(
          0,
          decimalsForParameterError,
        );
      });
    });

    it('should return solution with lowest error', () => {
      const data = {
        x: [
          0, 0.6283185307179586, 1.2566370614359172, 1.8849555921538759,
          2.5132741228718345, 3.141592653589793, 3.7699111843077517,
          4.39822971502571, 5.026548245743669, 5.654866776461628,
        ],
        y: [
          0, 1.902113032590307, 1.1755705045849465, -1.175570504584946,
          -1.9021130325903073, -4.898587196589413e-16, 1.902113032590307,
          1.1755705045849467, -1.1755705045849456, -1.9021130325903075,
        ],
      };
      const options = {
        damping: 1.5,
        initialValues: [0.594398586701882, 0.3506424963635226],
        gradientDifference: 1e-2,
        maxIterations: 100,
        errorTolerance: 1e-2,
      };

      const actual = levenbergMarquardt(data, sinFunction, options);
      const manualCalculatedError = data.x
        // @ts-expect-error number[] vs [number, number]
        .map(sinFunction(actual.parameterValues))
        .reduce((acc, yHat, i) => acc + (data.y[i] - yHat) ** 2, 0);
      expect(actual.parameterError).toBeCloseTo(
        manualCalculatedError,
        options.errorTolerance,
      );
      expect(actual.parameterError).toBeCloseTo(15.5, options.errorTolerance);
    });
  });

  describe('"Real-world" problems (noisy data)', () => {
    // In these problems, an imperfect/noisy set of data points is provided, so no "perfect fit" exists; we just get as close as we can
    const realWorldProblems = [
      {
        name: 'fourParamEq',
        getFunctionFromParameters:
          ([a, b, c, d]) =>
          (t) =>
            a + (b - a) / (1 + Math.pow(c, d) * Math.pow(t, -d)),
        data: {
          // Where did these values come from / why they are correct?
          x: [
            9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7,
            0.00000258, 0.0000155, 0.0000929,
          ],
          y: [
            7.807, -3.74, 21.119, 2.382, 4.269, 41.57, 73.401, 98.535, 97.059,
            92.147,
          ],
        },
        expected: {
          iterations: 200,
          parameterError: 16398.0009709,
          parameterValues: [-16.7697, 43.4549, 1018.8938, -4.3514],
        },
        options: {
          damping: 0.00001,
          maxIterations: 200,
          weights: 1,
          initialValues: new Float64Array([0, 100, 1, 0.1]),
        },
      },
    ];

    realWorldProblems.forEach((problem) => {
      const testInvocation = problem.skip ? it.skip.bind(it) : it;
      testInvocation(`Should fit ${problem.name} to raw data`, () => {
        const { data, expected, getFunctionFromParameters, options, decimals } =
          Object.assign(
            {
              decimals: 3,
            },
            problem,
          );
        const actual = levenbergMarquardt(
          data,
          getFunctionFromParameters,
          options,
        );
        actual.parameterValues = Array.from(actual.parameterValues);
        expect(actual).toMatchCloseTo(expected, decimals);
      });
    });
  });
});
