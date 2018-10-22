import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import levenbergMarquardt from '..';

expect.extend({ toBeDeepCloseTo });

describe('levenberg-marquardt test', () => {
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
});

function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
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
