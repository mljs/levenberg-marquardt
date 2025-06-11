import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'eslint-config-cheminfo-typescript/base.js';

export default defineConfig(globalIgnores(['coverage', 'lib']), ts);