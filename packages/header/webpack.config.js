const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin =
  require('webpack').container.ModuleFederationPlugin
const Dotenv = require('dotenv-webpack')
const dependencies = require('./package.json').dependencies

const envPaths = {
  production: path.resolve('./', `.env.production`),
  development: path.resolve('./', `.env.development`),
}

module.exports = (_, args) => {
  const envPath = envPaths[args.mode]

  require('dotenv').config({ path: envPath })

  return {
    mode: args.mode,

    output: {
      publicPath: 'auto',
    },

    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 3001,
      publicPath: '/',
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
          },
        },
        {
          test: /\.md$/,
          loader: 'raw-loader',
        },
        {
          test: /\.css$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ['file-loader'],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        /**
         * @name name
         * @type string
         * @description ?? o nome do m??dulo na federa????o
         */

        name: 'header',

        /**
         * @name filename
         * @type string
         * @description ?? o arquivo que contem as defini????es do m??dulo para a federa????o.
         * Caso o m??dulo seja servido no endere??o http://localhost:3002, ent??o n??s baixaremos as defini????es dele em
         * http://localhost:3002/remoteEntry.js
         */
        filename: 'remoteEntry.js',

        /**
         * @name remotes
         * @description ?? a lista dos m??dulos dos quais essa aplica????o depende. ?? um objeto de chave/valor onde a chave
         * ?? o nome do m??dulo e o valor segue o seguinte padr??o NOME_DO_MODULO@ENDERE??O_DE_SUA_DEFINI????O.
         * Exemplo: shared@http://localhost:3003/remoteEntry.js
         */
        remotes: {},

        /**
         * @name exposes
         * @description ?? o objeto de defini????o de quais m??dulos dessa aplica????o ser??o expostos. As chaves do objeto
         * s??o o path do m??dulo para a federa????o e o valor ?? o path do m??dulo nessa aplica????o.
         * Exemplo: './App':'./src/App'
         */
        exposes: {
          './Header': './src/components/Header'
        },

        /**
         * @name shared
         * @description s??o as depend??ncias compartilhadas pelos m??dulos da federa????o, aqui voc?? pode ter um array com
         * o nome de cada depend??ncia compartilhada ou um objeto com a chave sendo o nome da depend??ncia e o valor um
         * objeto de configura????o que vai definir se esse m??dulo ser?? um singleton, qual a vers??o suportada e etc
         */
        shared: {
          ...dependencies,
          'react-dom': {
            requiredVersion: dependencies['react-dom'],
            singleton: true,
          },
          react: {
            requiredVersion: dependencies['react'],
            singleton: true,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        env: (args.mode === 'production') ? '<script src="env.js"></script>' : ''
      }),
      new Dotenv({
        safe: true,
        path: envPath,
      }),
    ],
  }
}
