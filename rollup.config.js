// libs
const typescript = require('typescript');
const path = require('path');

// plugins
const typescriptPlugin = require('rollup-plugin-typescript2');
const resolvePlugin = require('rollup-plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');

// const
const pkg = require('./package.json');
const extensions = ['.js', '.ts'];

const plugins = isOld => [
  resolvePlugin({ extensions: extensions }),
  typescriptPlugin({
    typescript: typescript,
    abortOnError: false,
    cacheRoot: path.resolve(__dirname, '.cache/.rts2_cache'),
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        target: isOld ? 'es5' : 'esnext',
      },
    },
  }),
  terser()
];

export default [
  {
    input: 'src/index.ts',
    plugins: plugins(false),
    output: [
      {
        format: 'es',
        file: pkg.module,
      },
    ],
    external: [],
  },
  {
    input: 'src/index.ts',
    plugins: plugins(true),
    output: [
      {
        format: 'cjs',
        file: pkg.main,
      },
    ],
    external: [],
  },
];
