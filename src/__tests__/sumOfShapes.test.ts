import { expect, test } from 'vitest';

import { levenbergMarquardt } from '../index.ts';

import type { ShapePeak } from './sumOfShapesModel.ts';
import { buildSumOfShapes, sample } from './sumOfShapesModel.ts';

const truePeaks: ShapePeak[] = [
  { x: -1, y: 1, shape: { kind: 'gaussian', fwhm: 0.5 } },
  { x: 1, y: 0.8, shape: { kind: 'lorentzian', fwhm: 0.4 } },
  { x: 3, y: 1.2, shape: { kind: 'pseudoVoigt', fwhm: 0.5, mu: 0.4 } },
];

const trueModel = buildSumOfShapes(truePeaks);
const { x, y } = sample(
  trueModel.parameterizedFunction(trueModel.parameters),
  -5,
  7,
  400,
);

const initialPeaks: ShapePeak[] = truePeaks.map((peak) => ({
  ...peak,
  x: peak.x + 0.1,
  y: peak.y * 0.85,
}));

test('fits a sum of shapes with the analytical jacobian from ml-peak-shape-generator', () => {
  const { parameterizedFunction, jacobianFunction, parameters } =
    buildSumOfShapes(initialPeaks);

  const result = levenbergMarquardt({ x, y }, parameterizedFunction, {
    initialValues: parameters,
    maxIterations: 100,
    damping: 1.5,
    errorTolerance: 1e-10,
    jacobianFunction,
  });

  expect(result.parameterValues).toBeDeepCloseTo(trueModel.parameters, 3);
  expect(result.parameterError).toBeCloseTo(0, 5);
});

test('analytical jacobian and finite differences reach the same sum-of-shapes fit', () => {
  const analyticalModel = buildSumOfShapes(initialPeaks);
  const finiteModel = buildSumOfShapes(initialPeaks);
  const options = {
    initialValues: analyticalModel.parameters,
    maxIterations: 100,
    damping: 1.5,
    errorTolerance: 1e-10,
  };

  const analytical = levenbergMarquardt(
    { x, y },
    analyticalModel.parameterizedFunction,
    { ...options, jacobianFunction: analyticalModel.jacobianFunction },
  );
  const finite = levenbergMarquardt(
    { x, y },
    finiteModel.parameterizedFunction,
    options,
  );

  expect(analytical.parameterValues).toBeDeepCloseTo(finite.parameterValues, 4);
});
