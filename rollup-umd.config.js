import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    file: 'lib/index-umd.js',
    exports: 'default',
  },
  plugins: [nodeResolve(), commonjs()],
};
