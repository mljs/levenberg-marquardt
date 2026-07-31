import { expect, test } from 'vitest';

import { levenbergMarquardt } from '../index.ts';

import type { ShapePeak } from './sumOfShapesModel.ts';
import { buildSumOfShapes, sample } from './sumOfShapesModel.ts';

const truePeaks: ShapePeak[] = [
  { x: -1, y: 1, shape: { kind: 'gaussian', fwhm: 0.5 } },
  { x: 1, y: 0.8, shape: { kind: 'gaussian', fwhm: 0.4 } },
  { x: 3, y: 1.2, shape: { kind: 'gaussian', fwhm: 0.5 } },
];

const trueModel = buildSumOfShapes(truePeaks);
const { x, y } = sample(
  trueModel.parameterizedFunction(trueModel.parameters),
  -5,
  7,
  400,
);

// A deterministic perturbation, so the residual has a floor the way measured
// data does. Without it the model reproduces the data exactly and the fit
// reaches `errorTolerance`, which is the case that already stops early.
for (let i = 0; i < y.length; i++) {
  y[i] += 1e-3 * Math.sin(i * 12.9898);
}

const initialPeaks: ShapePeak[] = truePeaks.map((peak) => ({
  ...peak,
  x: peak.x + 0.05,
  y: peak.y * 0.9,
}));

/**
 * Fit the sample data, optionally disabling the relative step criterion.
 * @param relativeStepTolerance - The criterion to use, `0` disables it.
 * @returns The levenberg-marquardt result.
 */
function fit(relativeStepTolerance?: number) {
  const { parameterizedFunction, jacobianFunction, parameters } =
    buildSumOfShapes(initialPeaks);
  return levenbergMarquardt({ x, y }, parameterizedFunction, {
    initialValues: parameters,
    maxIterations: 100,
    damping: 1.5,
    // the sum of the squared residuals over 400 points never gets this low,
    // so without a second criterion the fit runs every iteration
    errorTolerance: 1e-12,
    jacobianFunction,
    ...(relativeStepTolerance !== undefined && { relativeStepTolerance }),
  });
}

test('stops once the parameters stop moving', () => {
  const stopped = fit();
  const exhausted = fit(0);

  expect(exhausted.iterations).toBe(100);
  expect(stopped.iterations).toBeLessThan(20);
  // stopping early must not change the answer
  expect(stopped.parameterValues).toStrictEqual(exhausted.parameterValues);
  expect(stopped.parameterError).toBe(exhausted.parameterError);
});

test('keeps iterating while the parameters still move', () => {
  const farPeaks: ShapePeak[] = truePeaks.map((peak) => ({
    ...peak,
    x: peak.x + 1.5,
    y: peak.y * 0.2,
    shape: { kind: 'gaussian', fwhm: 2 },
  }));
  const { parameterizedFunction, jacobianFunction, parameters } =
    buildSumOfShapes(farPeaks);

  const result = levenbergMarquardt({ x, y }, parameterizedFunction, {
    initialValues: parameters,
    maxIterations: 100,
    damping: 1.5,
    errorTolerance: 1e-12,
    jacobianFunction,
  });

  expect(result.iterations).toBe(100);
});

test('a zero tolerance never triggers on its own', () => {
  const result = fit(0);

  expect(result.iterations).toBe(100);
});
