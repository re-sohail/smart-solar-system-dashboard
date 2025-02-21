import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import localConfig from './my-eslint-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['**/temp.js', 'config/*'],
  },
  localConfig,
  // Handle React plugin configuration through compat
  ...compat.extends('plugin:react/recommended'),
  {
    // Add other flat-config compatible settings here
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];