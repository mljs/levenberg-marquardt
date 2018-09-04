import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import levenbergMarquardt from '..';

expect.extend({ toBeDeepCloseTo });

function fourParamEq([a, b, c, d]) {
  return (t) => (a + ((b - a) / (1 + (Math.pow(c, d) * Math.pow(t, -d)))));
}

function bennet5([b1, b2, b3]) {
  return (t) => (b1 * Math.pow((t + b2), -1 / b3));
}

const data = {
  x: [9.22e-12, 5.53e-11, 3.32e-10, 1.99e-9, 1.19e-8, 7.17e-8, 4.3e-7, 0.00000258, 0.0000155, 0.0000929],
  y: [7.807, -3.740, 21.119, 2.382, 4.269, 41.570, 73.401, 98.535, 97.059, 92.147]
};

const bennett5Parameter = [2, 3, 5];
let bennet5Func = bennet5(bennett5Parameter);
let bennet5XData = new Array(154).fill(0).map((e, i) => -3 + (i + 1) * 0.3419);
let bennett5YData = bennet5XData.map((e) => bennet5Func(e));

const bennet5Data = {
  x: bennet5XData,
  y: bennett5YData
};

test('bennet5 problem', () => {
  const options = {
    damping: 0.00001,
    maxIterations: 1000,
    errorTolerance: 1e-3,
    maxBound: [11, 11, 11],
    minBound: [1, 1, 1],
    initialValues: [3.5, 3.8, 4]
  };

  let result = levenbergMarquardt(bennet5Data, bennet5, options);
  expect(result.parameterValues).toBeDeepCloseTo(bennett5Parameter, 3);
});

test('fourParamEq', () => {
  const options = {
    damping: 0.00001,
    maxIterations: 200,
    initialValues: [0, 100, 1, 0.1]
  };

  expect(levenbergMarquardt(data, fourParamEq, options)).toBeDeepCloseTo({
    iterations: 200,
    parameterError: 374.6448,
    parameterValues: [-16.7697, 43.4549, 1018.8938, -4.3514]
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
    parameterValues: [-64.298, 117.4022, -47.0851, -0.06148]
  }, 3);
});
