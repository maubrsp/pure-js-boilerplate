var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var SpritesmithPlugin = require('webpack-spritesmith');
var site = require('../assets/site.json');
var index = require('../assets/index.json');
var faq = require('../assets/faq.json');
var pacotes = require('../assets/pacotes.json');

var argv;
try {
  argv = JSON.parse(process);
} catch (ex) {
  argv = process.argv;
}

let jsEntries = {};
let htmlEntries = {};
let pageData = {
  index: index,
  faq: faq,
  pacotes: pacotes
};

site.pages.forEach((value, index) => {
  jsEntries[value.id] =
    site.configs.js + '/' + value.id + '/' + value.id + '.js';
  jsEntries[value.id + '.mobile'] =
    site.configs.js + '/' + value.id + '/' + value.id + '.mobile.js';

  htmlEntries[value.id] =
    site.configs.html + '/' + value.id + '/' + value.id + '.ejs';
  htmlEntries[value.id + '.mobile'] =
    site.configs.html + '/' + value.id + '/' + value.id + '.mobile.ejs';
});

jsEntries['prerender'] = './src/libs/' + 'prerender.js';
let tmpHash = Math.round(Math.random() * 11111111 + 99999999);

/*console.log(`argv: ${argv[2]}`);*/
var production = argv[2] == '-p' ? true : false;
var dir = production ? '../www' : './../dev';

let urls = {
  url: production
    ? site.configs.url
    : site.configs.local_url + ':' + site.configs.localport + '/',
  libs_url: production
    ? site.configs.libs_url
    : site.configs.local_libs_url + ':' + site.configs.localport + '/',
  images_url: production
    ? site.configs.images_url
    : site.configs.local_images_url.replace('[port]', site.configs.localport) +
      '/'
};

var config = {
  entry: jsEntries,
  output: {
    path: path.join(__dirname, dir),
    publicPath: '',
    filename: '[name]/[name].' + tmpHash + '.js',
    chunkFilename: '[name]/[id].chunk.js'
  },
  resolve: {
    /*root: [],*/
    extensions: ['.json', '.js', '.less', '.css', '.ejs']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        }) /*ExtractTextPlugin.extract("style", "css")*/
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!less-loader'
        }) /* ExtractTextPlugin.extract("css!less")*/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['es2015']
        }
      },
      // {
      // 	test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      // 	loader: "file-loader",
      // 	options: {
      // 		name: "../fonts/[name].[ext]?[hash]"
      // 	}
      // },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 30720 * 7,
          name: 'images/[name].' + tmpHash + '.[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanPlugin([dir]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
    }),
    new ExtractTextPlugin('[name]/[name].' + tmpHash + '.css'),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  devServer: {
    host: 'localhost',
    port: 8080,
    inline: true,
    hot: false
  }
};

module.exports = config;

Object.keys(htmlEntries).forEach(function(key) {
  var conf = {
    filename: key + '/' + key + '.html',
    template: htmlEntries[key],
    inject: false,
    hash: false,
    pageData: pageData[key.split('.')[0]],
    production: production,
    currentHash: tmpHash,
    url: urls.url,
    libs_url: urls.libs_url,
    images_url: urls.images_url,
    chunks: ['common', key]
    //minify: true,
    /*
		,
        minify: { 
			removeComments: false,
			collapseWhitespace: false, 
			removeAttributeQuotes: false
		}
		*/
  };
  config.plugins.push(new HtmlWebpackPlugin(conf));
});

function getEntry(globPath) {
  var files = glob.sync(globPath);
  var entries = {},
    entry,
    dirname,
    basename,
    pathname,
    extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.join(dirname, basename);
    entries[pathname] = './' + entry;
  }
  return entries;
}
