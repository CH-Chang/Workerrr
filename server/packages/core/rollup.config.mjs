import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'
import nodeExternals from 'rollup-plugin-node-externals';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.mts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      }
    ],
    plugins: [
      nodeExternals(),
      resolve(),
      typescript(),
      commonjs(),
      json(),
      terser()
    ]
  },
  {
    input: 'src/index.mts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  }
];
