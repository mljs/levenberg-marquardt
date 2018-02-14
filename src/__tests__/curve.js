import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import levenbergMarquardt from '..';

expect.extend({ toBeDeepCloseTo });

function fourParamEq([a, b, c, d]) {
  return (t) => (a + ((b - a) / (1 + (Math.pow(c, d) * Math.pow(t, -d)))));
}

const data = {
  x: [9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7, 0.00000258, 0.0000155, 0.0000929],
  y: [7.807, -3.740, 21.119, 2.382, 4.269, 41.570, 73.401, 98.535, 97.059, 92.147]
};

test('fourParamEq', () => {
  const options = {
    damping: 0.00001,
    maxIterations: 200,
    initialValues: [0, 100, 1, 0.1]
  };

  expect(levenbergMarquardt(data, fourParamEq, options)).toBeDeepCloseTo({
    iterations: 200,
    parameterError: 374.6448,
    parameterValues: [-16.7697, 43.4549, 1018.8938, -4.3514],
    goodnessOfFit: 370,
  }, 3);
});

test('error is NaN', () => {
  const options = {
    damping: 0.01,
    maxIterations: 200,
    initialValues: [0, 100, 1, 0.1]
  };

  expect(levenbergMarquardt(data, fourParamEq, options)).toBeDeepCloseTo({
    iterations: 0,
    parameterError: NaN,
    parameterValues: [-64.298, 117.4022, -47.0851, -0.06148],
    goodnessOfFit: 0.0,
  }, 3);
});
