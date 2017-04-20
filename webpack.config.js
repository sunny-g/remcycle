const path = require('path');
const SRC_DIR = path.resolve(__dirname, 'src');
const DIST_DIR = path.resolve(__dirname, 'commonjs');
const EXAMPLE_DIR = path.resolve(__dirname, 'example');
const libraryName = 'remcycle';

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      [ 'es2015', { modules: false } ],
      'stage-0',
    ],
  },
};
const tsLoader = {
  loader: 'ts-loader',
  options: {
    compilerOptions: {
      declaration: false,
      moduleResolution: 'node',
      module: 'commonjs',
      target: 'es5',
    },
  },
};

module.exports = {
  devServer: {
    contentBase: EXAMPLE_DIR,
    port: 8080,
  },

  entry: {
    'remcycle': './src/index.ts',
  },

  output: {
    path: DIST_DIR,
    filename: '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  resolve: {
    extensions: [ '.js', '.ts' ],
  },

  module: {

    rules: [{
      test: /\.ts/,
      include: SRC_DIR,
      exclude: /node_modules/,
      use: [
        babelLoader,
        tsLoader,
      ],
    }, {
      test: /\.js/,
      include: SRC_DIR,
      exclude: /node_modules/,
      use: [
        babelLoader,
      ],
    }],
  },
};
