var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var SpritesmithPlugin = require('webpack-spritesmith');
var siteData = require('./src/assets/site.json');

var argv;
try {
  argv = JSON.parse(process);
} catch (ex) {
  argv = process.argv;
}

/*console.log(`argv: ${argv[2]}`);*/
var production = argv[2] == '-p' ? true : false;
var dir = production ? 'dist' : 'dev';

var config = {
  entry: {
    index: './src/js/index.js',
    list: './src/js/list.js',
    about: './src/js/about.js'
  },
  output: {
    path: path.join(__dirname, dir),
    publicPath: '',
    filename: 'js/[name].[hash:6].js',
    chunkFilename: 'js/[id].chunk.js'
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
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: '../fonts/[name].[ext]?[hash]'
        }
      },
      {
        // match image files
        test: /\.(jpe?g|png|svg|gif)$/,

        // match one of the loader's main parameters (sizes and placeholder)
        resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/,

        use: [
          'srcset-loader',
          //   // any other loader
          'url-loader?hash=sha512&digest=hex&name=images/[name].[hash].[ext]'
          //   'image-webpack-loader?optimizationLevel=7&interlaced=false',
        ]
      }
    ]
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //    $: "jquery",
    //    jQuery: "jquery",
    //    "window.jQuery": "jquery"
    // }),
    new CleanPlugin([dir]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
      //minChunks: 3
    }),
    new ExtractTextPlugin('css/[name].[hash:6].css'),

    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, './src/images/icons'),
        glob: '*.png'
      },
      target: {
        image: path.resolve(__dirname, './src/css/sprites/sprite.png'),
        css: path.resolve(__dirname, './src/css/sprites/sprite.css')
      },
      apiOptions: {
        cssImageRef: '../sprites/sprite.png'
      },
      spritesmithOptions: {
        algorithm: 'top-down'
      }
    }),

    /*new CopyWebpackPlugin([
            {from: "./src/images", to: "images"}
        ]),*/
    new CopyWebpackPlugin([{ from: './src/fonts', to: './fonts' }]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  // externals: {
  //     $: "jQuery"
  // },
  //devtool: "#source-map",
  devServer: {
    // contentBase: "./",
    host: 'localhost',
    port: 8199,
    inline: true,
    hot: false
  }
};

module.exports = config;

var pages = Object.keys(getEntry('./src/*.ejs'));

pages.forEach(function(pathname) {
  var itemName = pathname.split('src\\');
  var conf = {
    filename: itemName[1] + '.html',
    //template: "?min=" + production + "!" + pathname + ".html",
    //template: "html-withimg-loader?min=" + production + "!" + pathname + ".ejs",
    template: pathname + '.ejs', //html模板路径
    //template: "!!inline-html-withimg-loader?min=" + production + "!" + pathname + ".html",

    //template: pathname + ".html",
    inject: true,
    hash: false,
    teste: siteData,
    chunks: [
      'common',
      itemName[1]
    ] /*,
		//minify: true,
        minify: {
			removeComments: false,
			collapseWhitespace: false, 
			removeAttributeQuotes: false
        }*/
  };
  config.plugins.push(new HtmlWebpackPlugin(conf));
});

//By file name to get the entry file (that is, the number of template files that need to be generated)
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
