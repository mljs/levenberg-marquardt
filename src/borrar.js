import { Matrix } from 'ml-matrix';
import { xNorm } from 'ml-spectra-processing';

let matrix = Matrix.from1DArray(10, 1, [1, 2, 3, 4, 5, 5, 4, 3, 2, 2]);

// console.log(matrix.transpose().mmul(matrix))
// matrix = matrix.transpose();
// console.log(matrix.mmul(matrix.transpose()))
// console.log(xNorm(matrix.to1DArray())**2)

// console.log(matrix.transpose());
let rand = Matrix.ones(1, 4);

// // console.log(matrix, rand);

let a = matrix.mmul(rand);

console.log(a);
