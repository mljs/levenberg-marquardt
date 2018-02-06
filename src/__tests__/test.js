import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import levenbergMarquardt from '..';

expect.extend({ toBeDeepCloseTo });

describe('levenberg-marquardt test', () => {
  it('Base example', () => {
    const len = 20;
    let data = {
      x: new Array(len),
      y: new Array(len)
    };
    let sampleFunction = sinFunction([2, 2]);
    for (let i = 0; i < len; i++) {
      data.x[i] = i;
      data.y[i] = sampleFunction(i);
    }
    const options = {
      damping: 0.1,
      initialValues: [3, 3]
    };

    const { parameterValues, parameterError } = levenbergMarquardt(
      data,
      sinFunction,
      options
    );
    expect(parameterValues).toBeDeepCloseTo([2, 2], 3);
    expect(parameterError).toBeCloseTo(0, 2);
  });

  it('Exceptions', () => {
    const options = {
      damping: 0.1,
      initialValues: [3, 3]
    };

    expect(() => levenbergMarquardt()).toThrow(
      'The damping option must be a positive number'
    );
    expect(() => levenbergMarquardt([1, 2], sinFunction, options)).toThrow(
      'The data parameter must have x and y elements'
    );
    expect(() =>
      levenbergMarquardt({ x: 1, y: 2 }, sinFunction, options)
    ).toThrow(
      'The data parameter elements must be an array with more than 2 points'
    );
    expect(() =>
      levenbergMarquardt({ x: [1, 2], y: [1, 2, 3] }, sinFunction, options)
    ).toThrow('The data parameter elements must have the same size');
    expect(() =>
      levenbergMarquardt({ x: [1, 2], y: [1, 2] }, sumOfLorentzians, {
        damping: 0.1,
        initialValues: 2
      })
    ).toThrow('initialValues must be an array');
  });

  it('Sigmoid example', () => {
    const len = 20;
    let data = {
      x: new Array(len),
      y: new Array(len)
    };
    let sampleFunction = sigmoidFunction([2, 2, 2]);
    for (let i = 0; i < len; i++) {
      data.x[i] = i;
      data.y[i] = sampleFunction(i);
    }
    const options = {
      damping: 0.1,
      initialValues: [3, 3, 3],
      maxIterations: 200
    };

    let { parameterValues, parameterError } = levenbergMarquardt(
      data,
      sigmoidFunction,
      options
    );
    expect(parameterValues).toBeDeepCloseTo([2, 2, 2], 1);
    expect(parameterError).toBeCloseTo(0, 1);
  });

  it('Sum of lorentzians example', () => {
    const len = 100;
    const pTrue = [1, 0.1, 0.3, 4, 0.15, 0.3];
    let data = {
      x: new Array(len),
      y: new Array(len)
    };

    let sampleFunction = sumOfLorentzians(pTrue);
    for (let i = 0; i < len; i++) {
      data.x[i] = i;
      data.y[i] = sampleFunction(i);
    }

    let { parameterValues } = levenbergMarquardt(data, sumOfLorentzians, {
      damping: 0.01,
      initialValues: [1.1, 0.15, 0.29, 4.05, 0.17, 0.28],
      maxIterations: 500,
      errorTolerance: 10e-5
    });

    expect(parameterValues).toBeDeepCloseTo(pTrue, 1);
  });
});

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}

function sigmoidFunction([a, b, c]) {
  return (t) => a / (b + Math.exp(-t * c));
}

function sumOfLorentzians(p) {
  return (t) => {
    var nL = p.length;
    var factor, p2;
    var result = 0;
    for (var i = 0; i < nL; i += 3) {
      p2 = Math.pow(p[i + 2] / 2, 2);
      factor = p[i + 1] * p2;
      result += factor / (Math.pow(t - p[i], 2) + p2);
    }
    return result;
  };
}
