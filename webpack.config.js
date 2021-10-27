const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

const BUILD_DIR = path.resolve(__dirname, './build');
const HASH = Math.round(Date.now() / 1000).toString();
const ASSET_PATH = process.env.ASSET_PATH || './';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: isDevelopment ? 'development' : 'production',

  bail: !isDevelopment,

  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',

  entry: {
    bundle: './src/index.tsx',
  },

  output: {
    path: BUILD_DIR,
    filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
    chunkFilename: '[id].[contenthash].js',
    globalObject: 'this',
    publicPath: ASSET_PATH,
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules', __dirname],
  },

  module: {
    rules: [
      {
        test: /\.postcss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'dts-css-modules-loader',
            options: {
              namedExport: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: isDevelopment
                  ? '[name]__[local]--[hash:base64:5]'
                  : '[hash:base64]',
                exportLocalsConvention: 'camelCaseOnly',
              },
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      stage: 1,
                      features: {
                        'nesting-rules': false,
                      },
                      importFrom: ['src/styles/mediaQueries.css'],
                    },
                  ],
                  'postcss-nested',
                ],
              },
            },
          },
        ],
      },

      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            env: {
              mode: 'usage',
              coreJs: 3,
            },
            jsc: {
              target: 'es2015',
              parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: false,
                dynamicImport: true,
              },
            },
          },
        },
      },

      {
        test: /\.(png|jpg|gif|ttf|eot|woff|woff2|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
    ],
  },

  optimization: {
    moduleIds: isDevelopment ? 'named' : 'deterministic',
    chunkIds: isDevelopment ? 'named' : 'deterministic',
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0,
        },
      },
    },
    minimize: !isDevelopment,
    minimizer: !isDevelopment ? [`...`, new CssMinimizerPlugin()] : undefined,
  },

  plugins: [
    process.env.ANALYZE && new StatoscopeWebpackPlugin(),

    !isDevelopment &&
      new CopyWebpackPlugin({
        patterns: [{ from: 'public' }],
      }),

    !isDevelopment &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
        ignoreOrder: true,
      }),

    new webpack.EnvironmentPlugin({
      HASH,
      ASSET_PATH,
    }),

    new HtmlWebpackPlugin({
      template: './src/template.html',
      hash: true,
      chunks: ['common', 'bundle', 'styles'],
    }),

    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ].filter(Boolean),

  devServer: isDevelopment
    ? {
        compress: false,
        host: 'localhost',
        port: process.env.PORT ?? 8080,
        historyApiFallback: true,
        hot: true,
      }
    : undefined,

  stats: {
    children: !isDevelopment,
  },
};
