import type { Shape1D } from 'ml-peak-shape-generator';
import { bench, describe } from 'vitest';

import type { ShapePeak } from '../src/__tests__/sumOfShapesModel.ts';
import { buildSumOfShapes, sample } from '../src/__tests__/sumOfShapesModel.ts';
import { levenbergMarquardt } from '../src/index.ts';

const kinds: Shape1D[] = [
  { kind: 'gaussian', fwhm: 0.3 },
  { kind: 'lorentzian', fwhm: 0.3 },
  { kind: 'pseudoVoigt', fwhm: 0.3, mu: 0.4 },
  { kind: 'lorentzianDispersive', fwhm: 0.3 },
  { kind: 'generalizedLorentzian', fwhm: 0.3, gamma: 0.6 },
  { kind: 'pseudoVoigtTCH', fwhmG: 0.3, fwhmL: 0.3 },
];

const FROM = -1;

/**
 * Register a benchmark comparing the analytical Jacobian (from
 * ml-peak-shape-generator) against finite differences for a sum-of-shapes fit.
 * @param nbPeaks - number of peaks (drives the parameter count).
 * @param nbPoints - number of sampled points.
 * @param shape - force every peak to this shape; defaults to a mix of all kinds.
 */
function registerScenario(
  nbPeaks: number,
  nbPoints: number,
  shape?: Shape1D,
): void {
  const to = nbPeaks + 1;
  const truePeaks: ShapePeak[] = Array.from({ length: nbPeaks }, (_, i) => ({
    x: FROM + 1 + (i * (to - FROM - 2)) / Math.max(1, nbPeaks - 1),
    y: 0.5 + (i % 5) * 0.15,
    shape: shape ?? kinds[i % kinds.length],
  }));
  const initialPeaks: ShapePeak[] = truePeaks.map((peak) => ({
    ...peak,
    x: peak.x + 0.05,
    y: peak.y * 0.9,
  }));

  const trueModel = buildSumOfShapes(truePeaks);
  const { x, y } = sample(
    trueModel.parameterizedFunction(trueModel.parameters),
    FROM,
    to,
    nbPoints,
  );

  const { parameterizedFunction, jacobianFunction, parameters, nbParameters } =
    buildSumOfShapes(initialPeaks);
  const options = {
    initialValues: parameters,
    minValues: parameters.map((value) => value - 5),
    maxValues: parameters.map((value) => value + 5),
    gradientDifference: 1e-3,
    maxIterations: 100,
    damping: 1.5,
    errorTolerance: 1e-8,
  };

  const label = `${nbPeaks} peaks, ${nbPoints} points, ${nbParameters} params`;
  describe(`sum of shapes — ${label}`, () => {
    bench('finite differences', () => {
      levenbergMarquardt({ x, y }, parameterizedFunction, options);
    });
    bench('analytical jacobian', () => {
      levenbergMarquardt({ x, y }, parameterizedFunction, {
        ...options,
        jacobianFunction,
      });
    });
  });
}

registerScenario(12, 2000);
registerScenario(12, 8000);
registerScenario(12, 2000, { kind: 'pseudoVoigt', fwhm: 0.3, mu: 0.4 });
