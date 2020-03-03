const LM = require('../lib/index');
const { Suite } = require('benchmark');
const suite = new Suite();

const contrivedProblems = [
  {
    name: 'bennet5([2, 3, 5])',
    getFunctionFromParameters: ([b1, b2, b3]) => (t) =>
      b1 * Math.pow(t + b2, -1 / b3),
    n: 10000,
    xStart: -2.6581,
    xEnd: 49.6526,
    problemParameters: [2, 3, 5],
    options: {
      damping: 0.00001,
      maxIterations: 1000,
      errorTolerance: 1e-3,
      maxBound: [11, 11, 11],
      minBound: [1, 1, 1],
      initialValues: [3.5, 3.8, 4],
    },
  },
  {
    name: '2*sin(2*t)',
    getFunctionFromParameters: ([a, f]) => (t) => a * Math.sin(f * t),
    n: 10000,
    xStart: 0,
    xEnd: 19,
    problemParameters: [2, 2],
    options: {
      damping: 0.1,
      initialValues: [3, 3],
    },
  },
  {
    name: 'Sigmoid',
    getFunctionFromParameters: ([a, b, c]) => (t) => a / (b + Math.exp(-t * c)),
    n: 10000,
    xStart: 0,
    xEnd: 19,
    problemParameters: [2, 2, 2],
    options: {
      damping: 0.1,
      initialValues: [3, 3, 3],
      maxIterations: 200,
    },
    decimalsForParameterValues: 1,
  },
  {
    name: 'Sum of lorentzians',
    getFunctionFromParameters: function sumOfLorentzians(p) {
      return (t) => {
        let nL = p.length;
        let factor, p2;
        let result = 0;
        for (let i = 0; i < nL; i += 3) {
          p2 = Math.pow(p[i + 2] / 2, 2);
          factor = p[i + 1] * p2;
          result += factor / (Math.pow(t - p[i], 2) + p2);
        }
        return result;
      };
    },
    n: 10000,
    xStart: 0,
    xEnd: 99,
    problemParameters: [1, 0.1, 0.3, 4, 0.15, 0.3],
    options: {
      damping: 0.01,
      initialValues: [1.1, 0.15, 0.29, 4.05, 0.17, 0.28],
      maxIterations: 500,
      errorTolerance: 10e-5,
    },
    decimalsForParameterValues: 1,
  },
];

suite.add('RegExp#test', () => {
  for (let problem of contrivedProblems) {
    const {
      getFunctionFromParameters,
      n,
      xStart,
      xEnd,
      problemParameters,
      options,
      decimalsForParameterError,
      decimalsForParameterValues,
    } = Object.assign(
      {
        decimalsForParameterError: 2,
        decimalsForParameterValues: 3,
      },
      problem,
    );
    const xs = new Array(n)
      .fill(0)
      .map((zero, i) => xStart + (i * (xEnd - xStart)) / (n - 1));
    const data = {
      x: xs,
      y: xs.map(getFunctionFromParameters(problemParameters)),
    };

    const actual = LM(data, getFunctionFromParameters, options);
  }
});

suite.on('cycle', function(event) {
  console.log(String(event.target));
});

suite.run({ async: true });
