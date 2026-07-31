import { expect, test } from 'vitest';

import { levenbergMarquardt } from '../index.ts';
import type { JacobianFunction } from '../types.ts';

// model: a * x + b -> d/da = x, d/db = 1
function line([a, b]: number[]) {
  return (x: number) => a * x + b;
}
const lineJacobian: JacobianFunction = () => (x: number) => [x, 1];

// model: a * exp(b * x) -> d/da = exp(b*x), d/db = a * x * exp(b*x)
function exponential([a, b]: number[]) {
  return (x: number) => a * Math.exp(b * x);
}
const exponentialJacobian: JacobianFunction =
  ([a, b]: number[]) =>
  (x: number) => {
    const e = Math.exp(b * x);
    return [e, a * x * e];
  };

// model: a * sin(b * t) -> d/da = sin(b*t), d/db = a * t * cos(b*t)
function sine([a, b]: number[]) {
  return (t: number) => a * Math.sin(b * t);
}
const sineJacobian: JacobianFunction =
  ([a, b]: number[]) =>
  (t: number) => [Math.sin(b * t), a * t * Math.cos(b * t)];

/** Sample a model on a regular grid. */
function sample(
  fn: (x: number) => number,
  from: number,
  to: number,
  n: number,
) {
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const value = from + (i * (to - from)) / (n - 1);
    x.push(value);
    y.push(fn(value));
  }
  return { x, y };
}

test('analytical jacobian recovers parameters of a linear model', () => {
  const x = [0, 1, 2, 3, 4, 5, 6];
  const y = [-2, 0, 2, 4, 6, 8, 10];

  const result = levenbergMarquardt({ x, y }, line, {
    initialValues: [1, 0],
    jacobianFunction: lineJacobian,
  });

  expect(result.parameterValues).toBeDeepCloseTo([2, -2], 4);
  expect(result.parameterError).toBeCloseTo(0, 4);
});

test('analytical jacobian recovers parameters of an exponential model', () => {
  const { x, y } = sample(exponential([2, 0.3]), 0, 4, 40);

  const result = levenbergMarquardt({ x, y }, exponential, {
    initialValues: [1, 0.1],
    maxIterations: 100,
    damping: 0.01,
    errorTolerance: 1e-12,
    jacobianFunction: exponentialJacobian,
  });

  expect(result.parameterValues).toBeDeepCloseTo([2, 0.3], 4);
});

test('analytical jacobian and finite differences reach the same solution', () => {
  const { x, y } = sample(sine([2, 0.6]), 0, 8, 60);
  const options = {
    initialValues: [1.5, 0.5],
    maxIterations: 100,
    damping: 0.1,
    errorTolerance: 1e-12,
  };

  const finite = levenbergMarquardt({ x, y }, sine, options);
  const analytical = levenbergMarquardt({ x, y }, sine, {
    ...options,
    jacobianFunction: sineJacobian,
  });

  expect(analytical.parameterValues).toBeDeepCloseTo(finite.parameterValues, 5);
  expect(analytical.parameterValues).toBeDeepCloseTo([2, 0.6], 5);
});

test('jacobianFunction is actually invoked (once per iteration)', () => {
  const { x, y } = sample(exponential([2, 0.3]), 0, 4, 40);
  let calls = 0;
  const countingJacobian: JacobianFunction = (params) => {
    calls++;
    return exponentialJacobian(params);
  };

  const result = levenbergMarquardt({ x, y }, exponential, {
    initialValues: [1, 0.1],
    maxIterations: 25,
    damping: 0.01,
    errorTolerance: 1e-12,
    jacobianFunction: countingJacobian,
  });

  expect(calls).toBeGreaterThan(0);
  expect(calls).toBe(result.iterations);
});

test('gradientDifference and centralDifference are ignored when a jacobian is given', () => {
  const x = [0, 1, 2, 3, 4, 5, 6];
  const y = [-2, 0, 2, 4, 6, 8, 10];

  // An absurd gradientDifference would wreck a finite-difference fit; with an
  // analytical jacobian it must be ignored and the fit still succeeds.
  const result = levenbergMarquardt({ x, y }, line, {
    initialValues: [1, 0],
    gradientDifference: 1e6,
    centralDifference: false,
    jacobianFunction: lineJacobian,
  });

  expect(result.parameterValues).toBeDeepCloseTo([2, -2], 4);
  expect(result.parameterError).toBeCloseTo(0, 4);
});

test('analytical jacobian converges in no more iterations than finite differences', () => {
  const { x, y } = sample(exponential([2, 0.3]), 0, 4, 40);
  const options = {
    initialValues: [1, 0.1],
    maxIterations: 100,
    damping: 0.01,
    errorTolerance: 1e-10,
  };

  const finite = levenbergMarquardt({ x, y }, exponential, options);
  const analytical = levenbergMarquardt({ x, y }, exponential, {
    ...options,
    jacobianFunction: exponentialJacobian,
  });

  expect(analytical.iterations).toBeLessThanOrEqual(finite.iterations);
  expect(analytical.parameterError).toBeLessThanOrEqual(
    finite.parameterError + 1e-9,
  );
});

test('analytical jacobian works with weights', () => {
  const { x, y } = sample(exponential([2, 0.3]), 0, 4, 40);

  const result = levenbergMarquardt({ x, y }, exponential, {
    initialValues: [1, 0.1],
    maxIterations: 100,
    damping: 0.01,
    errorTolerance: 1e-12,
    weights: 1,
    jacobianFunction: exponentialJacobian,
  });

  expect(result.parameterValues).toBeDeepCloseTo([2, 0.3], 4);
});
