import type { Shape1D, Shape1DInstance } from 'ml-peak-shape-generator';
import { getShape1D } from 'ml-peak-shape-generator';

import type { JacobianFunction, ParameterizedFunction } from '../types.ts';

export interface ShapePeak {
  x: number;
  y: number;
  shape: Shape1D;
}

interface InternalPeak {
  shapeFct: Shape1DInstance;
  /** shape parameter names, e.g. ['fwhm'] or ['fwhm', 'mu'] */
  parameterNames: string[];
  /** offset of this peak's `[x, y, ...shapeParams]` slice in the parameter vector */
  fromIndex: number;
}

/**
 * Build a `levenbergMarquardt` model for a sum of peak shapes and its exact
 * analytical Jacobian, using ml-peak-shape-generator. Each peak occupies the
 * slice `[x, y, ...shapeParameters]` of the parameter vector. The model is
 * `sum_i y_i * shape_i.fct(x - x0_i)`.
 * @param peaks - the peaks describing the model structure (and seed values).
 * @returns the parameterized model, its analytical Jacobian, the parameter
 * vector seeded from `peaks`, and the total parameter count.
 */
export function buildSumOfShapes(peaks: ShapePeak[]): {
  parameterizedFunction: ParameterizedFunction;
  jacobianFunction: JacobianFunction;
  parameters: number[];
  nbParameters: number;
} {
  const internalPeaks: InternalPeak[] = [];
  const parameters: number[] = [];
  let index = 0;
  for (const peak of peaks) {
    const shapeFct = getShape1D(peak.shape);
    const parameterNames = shapeFct.getParameters();
    internalPeaks.push({ shapeFct, parameterNames, fromIndex: index });
    const shapeValues = peak.shape as unknown as Record<string, number>;
    parameters.push(
      peak.x,
      peak.y,
      ...parameterNames.map((n) => shapeValues[n]),
    );
    index += 2 + parameterNames.length;
  }
  const nbParameters = index;

  function syncShapeParameters(values: number[]): void {
    for (const peak of internalPeaks) {
      const target = peak.shapeFct as unknown as Record<string, number>;
      for (let i = 0; i < peak.parameterNames.length; i++) {
        target[peak.parameterNames[i]] = values[peak.fromIndex + 2 + i];
      }
    }
  }

  const parameterizedFunction: ParameterizedFunction = (values) => {
    syncShapeParameters(values);
    return (x) => {
      let total = 0;
      for (const peak of internalPeaks) {
        const x0 = values[peak.fromIndex];
        const y = values[peak.fromIndex + 1];
        total += y * peak.shapeFct.fct(x - x0);
      }
      return total;
    };
  };

  const jacobianFunction: JacobianFunction = (values) => {
    syncShapeParameters(values);
    return (x) => {
      const gradient = new Array<number>(values.length).fill(0);
      for (const peak of internalPeaks) {
        const x0 = values[peak.fromIndex];
        const y = values[peak.fromIndex + 1];
        const {
          fct,
          dx,
          parameters: shapeGradient,
        } = peak.shapeFct.derivative(x - x0);
        gradient[peak.fromIndex] += -y * dx;
        gradient[peak.fromIndex + 1] += fct;
        for (let k = 0; k < shapeGradient.length; k++) {
          gradient[peak.fromIndex + 2 + k] += y * shapeGradient[k];
        }
      }
      return gradient;
    };
  };

  return { parameterizedFunction, jacobianFunction, parameters, nbParameters };
}

/**
 * Sample a model on a regular grid.
 * @param model - function to evaluate.
 * @param from - first x value.
 * @param to - last x value.
 * @param nbPoints - number of points.
 * @returns the sampled `{ x, y }` arrays.
 */
export function sample(
  model: (x: number) => number,
  from: number,
  to: number,
  nbPoints: number,
): { x: Float64Array; y: Float64Array } {
  const x = new Float64Array(nbPoints);
  const y = new Float64Array(nbPoints);
  for (let i = 0; i < nbPoints; i++) {
    x[i] = from + (i * (to - from)) / (nbPoints - 1);
    y[i] = model(x[i]);
  }
  return { x, y };
}
