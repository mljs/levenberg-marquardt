import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import levenbergMarquardt from '..';

expect.extend({ toBeDeepCloseTo });

describe('Contrived problems (clean data)', () => {
  // In these cases we test the algorithm's ability to find an , we use some pre-selected values and generate the data set and see if the algorithm can get close the the exact solution
  const contrivedProblems = [
    {
      skip: false,
      name: 'bennet5([2, 3, 5])',
      getFunctionFromParameters: ([b1, b2, b3]) => ((t) => b1 * Math.pow(t + b2, -1 / b3)),
      n: 154,
      xStart: -2.6581,
      xEnd: 49.6526,
      problemParameters: [2, 3, 5],
      options: {
        damping: 0.00001,
        maxIterations: 1000,
        errorTolerance: 1e-3,
        maxBound: [11, 11, 11],
        minBound: [1, 1, 1],
        initialValues: [3.5, 3.8, 4]
      }
    }
  ];

  contrivedProblems.forEach((problem) => {
    const testInvocation = (problem.skip) ? it.skip.bind(it) : it;
    testInvocation(`Should fit ${problem.name}`, () => {
      const { getFunctionFromParameters, n, xStart, xEnd, problemParameters, options, decimals } = Object.assign({
        decimals: 3
      }, problem);
      const xs = new Array(n).fill(0).map((zero, i) => xStart + (i * (xEnd - xStart)) / (n - 1));
      const data = {
        x: xs,
        y: xs.map(getFunctionFromParameters(problemParameters))
      };

      const actual = levenbergMarquardt(data, getFunctionFromParameters, options);
      expect(actual.parameterValues).toBeDeepCloseTo(problemParameters, decimals);
    });
  });
});

describe('"Real-world" problems (noisy data)', () => {
  // In these problems, an imperfect/noisy set of data points is provided, so no "perfect fit" exists; we just get as close as we can
  const realWorldProblems = [
    {
      name: 'fourParamEq',
      getFunctionFromParameters: ([a, b, c, d]) => ((t) => a + (b - a) / (1 + Math.pow(c, d) * Math.pow(t, -d))),
      data: {
        // Where did these values come from / why they are correct?
        x: [9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7, 0.00000258, 0.0000155, 0.0000929],
        y: [7.807, -3.74, 21.119, 2.382, 4.269, 41.57, 73.401, 98.535, 97.059, 92.147]
      },
      expected: {
        iterations: 200,
        parameterError: 374.6448,
        parameterValues: [-16.7697, 43.4549, 1018.8938, -4.3514]
      },
      options: {
        damping: 0.00001,
        maxIterations: 200,
        initialValues: [0, 100, 1, 0.1]
      }
    }
  ];

  realWorldProblems.forEach((problem) => {
    const testInvocation = (problem.skip) ? it.skip.bind(it) : it;
    testInvocation(`Should fit ${problem.name} to raw data`, () => {
      const { data, expected, getFunctionFromParameters, options, decimals } = Object.assign({
        decimals: 3
      }, problem);
      const actual = levenbergMarquardt(data, getFunctionFromParameters, options);
      expect(actual).toBeDeepCloseTo(expected, decimals);
    });
  });
});


describe('Handling of ill-behaved functions', () => {
  it('Should stop and return parameterError=NaN if function evaluates to NaN after starting', () => {
    const fourParamEq = ([a, b, c, d]) => ((t) => a + (b - a) / (1 + Math.pow(c, d) * Math.pow(t, -d)));
    const data = {
      x: [9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7, 0.00000258, 0.0000155, 0.0000929],
      y: [7.807, -3.74, 21.119, 2.382, 4.269, 41.57, 73.401, 98.535, 97.059, 92.147]
    };
    const options = {
      damping: 0.01,
      maxIterations: 200,
      initialValues: [0, 100, 1, 0.1]
      // Note: This test is identical to the other fourParamEq test, except for the
      // damping parameter. The increased damping option leads to a case where
      // c < 0 && d is not an integer so Math.pow(c, d) is NaN
    };

    expect(levenbergMarquardt(data, fourParamEq, options)).toBeDeepCloseTo({
      iterations: 0,
      parameterError: NaN,
      parameterValues: [-64.298, 117.4022, -47.0851, -0.06148]
    }, 3);
  });
});
