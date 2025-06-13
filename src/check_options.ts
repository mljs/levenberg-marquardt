import { isAnyArray } from 'is-any-array';

import type { Data2D, LevenbergMarquardtOptions } from './types.ts';

export interface CheckedOptions {
  checkTimeout: () => boolean;
  minValues: ArrayLike<number>;
  maxValues: ArrayLike<number>;
  parameters: number[];
  weightSquare: number[];
  damping: number;
  dampingStepUp: number;
  dampingStepDown: number;
  maxIterations: number;
  errorTolerance: number;
  centralDifference: boolean;
  gradientDifference: number[];
  improvementThreshold: number;
}

export default function checkOptions(
  data: Data2D,
  options: LevenbergMarquardtOptions,
): CheckedOptions {
  const {
    timeout,
    initialValues,
    weights = 1,
    damping = 1e-2,
    dampingStepUp = 11,
    dampingStepDown = 9,
    maxIterations = 100,
    errorTolerance = 1e-7,
    centralDifference = false,
    gradientDifference = 10e-2,
    improvementThreshold = 1e-3,
  } = options;
  let { minValues, maxValues } = options;

  if (damping <= 0) {
    throw new Error('The damping option must be a positive number');
  } else if (!data.x || !data.y) {
    throw new Error('The data parameter must have x and y elements');
  } else if (
    !isAnyArray(data.x) ||
    data.x.length < 2 ||
    !isAnyArray(data.y) ||
    data.y.length < 2
  ) {
    throw new Error(
      'The data parameter elements must be an array with more than 2 points',
    );
  } else if (data.x.length !== data.y.length) {
    throw new Error('The data parameter elements must have the same size');
  }

  if (!(initialValues && initialValues.length > 0)) {
    throw new Error(
      'The initialValues option is mandatory and must be an array',
    );
  }
  const parameters = Array.from(initialValues);

  const parLen = parameters.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('minValues and maxValues must be the same size');
  }

  const gradientDifferenceArray = getGradientDifferenceArray(
    gradientDifference,
    parameters,
  );

  const filler = getFiller(weights, data.x.length);
  const checkTimeout = getCheckTimeout(timeout);

  const weightSquare = Array.from({ length: data.x.length }, (_, i) =>
    filler(i),
  );

  return {
    checkTimeout,
    minValues,
    maxValues,
    parameters,
    weightSquare,
    damping,
    dampingStepUp,
    dampingStepDown,
    maxIterations,
    errorTolerance,
    centralDifference,
    gradientDifference: gradientDifferenceArray,
    improvementThreshold,
  };
}

function getGradientDifferenceArray(
  gradientDifference: number | ArrayLike<number>,
  parameters: number[],
): number[] {
  if (typeof gradientDifference === 'number') {
    return new Array(parameters.length).fill(gradientDifference);
  } else if (isAnyArray(gradientDifference)) {
    const parLen = parameters.length;
    if (gradientDifference.length !== parLen) {
      return new Array(parLen).fill(gradientDifference[0]);
    }
    return Array.from(gradientDifference);
  }

  throw new Error(
    'gradientDifference should be a number or array with length equal to the number of parameters',
  );
}

function getFiller(
  weights: number | ArrayLike<number>,
  dataLength: number,
): (i: number) => number {
  if (typeof weights === 'number') {
    const value = 1 / weights ** 2;
    return () => value;
  } else if (isAnyArray(weights)) {
    if (weights.length < dataLength) {
      const value = 1 / weights[0] ** 2;
      return () => value;
    }

    return (i: number) => 1 / weights[i] ** 2;
  }

  throw new Error(
    'weights should be a number or array with length equal to the number of data points',
  );
}

function getCheckTimeout(timeout: number | undefined): () => boolean {
  if (timeout !== undefined) {
    if (typeof timeout !== 'number') {
      throw new Error('timeout should be a number');
    }
    const endTime = Date.now() + timeout * 1000;
    return () => Date.now() > endTime;
  } else {
    return () => false;
  }
}
