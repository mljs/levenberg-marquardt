import { isAnyArray } from 'is-any-array';

export default function checkOptions(data, parameterizedFunction, options) {
  let {
    timeout,
    minValues,
    maxValues,
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

  let parameters =
    initialValues || new Array(parameterizedFunction.length).fill(1);

  let nbPoints = data.y.length;
  let parLen = parameters.length;
  maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
  minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

  if (maxValues.length !== minValues.length) {
    throw new Error('minValues and maxValues must be the same size');
  }

  if (!isAnyArray(parameters)) {
    throw new Error('initialValues must be an array');
  }

  if (typeof gradientDifference === 'number') {
    gradientDifference = new Array(parameters.length).fill(gradientDifference);
  } else if (isAnyArray(gradientDifference)) {
    if (gradientDifference.length !== parLen) {
      gradientDifference = new Array(parLen).fill(gradientDifference[0]);
    }
  } else {
    throw new Error(
      'gradientDifference should be a number or array with length equal to the number of parameters',
    );
  }

  let filler;
  if (typeof weights === 'number') {
    let value = 1 / weights ** 2;
    filler = () => value;
  } else if (isAnyArray(weights)) {
    if (weights.length < data.x.length) {
      let value = 1 / weights[0] ** 2;
      filler = () => value;
    } else {
      filler = (i) => 1 / weights[i] ** 2;
    }
  } else {
    throw new Error(
      'weights should be a number or array with length equal to the number of data points',
    );
  }

  let checkTimeout;
  if (timeout !== undefined) {
    if (typeof timeout !== 'number') {
      throw new Error('timeout should be a number');
    }
    let endTime = Date.now() + timeout * 1000;
    checkTimeout = () => Date.now() > endTime;
  } else {
    checkTimeout = () => false;
  }

  let weightSquare = new Array(data.x.length);
  for (let i = 0; i < nbPoints; i++) {
    weightSquare[i] = filler(i);
  }

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
    gradientDifference,
    improvementThreshold,
  };
}
