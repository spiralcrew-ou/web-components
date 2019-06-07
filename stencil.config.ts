import { Config } from '@stencil/core';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'collectiveone-component-lib',
  outputTargets: [
    { type: 'dist' },
    { type: 'docs' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  plugins: [
    sass({
      includePaths: ['./node_modules'],
      // injectGlobalPaths: ['src/globals/variables.scss']
    }),
    builtins(),
    globals()
  ],
  nodeResolve: {
    browser: true,
    preferBuiltins: true
  }
};
