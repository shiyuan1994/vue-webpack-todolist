const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin') // 将非javascript文件打包成单独的静态文件

const isDev = process.env.NODE_ENV === 'development' // 是否是在开发环境


const config = {
  target: 'web',
  mode: 'development', // 模式：开发环境--不会对打包的js代码进行压缩  production：生产环境--会对打包的js代码进行压缩
  entry: path.join(__dirname, 'src/index.js'), // 入口文件 __dirname: 当前js文件所在目录的绝对路径,指定要打包的文件
  output: { // 出口文件
    filename: 'bundle.js', // 出口文件名
    path: path.join(__dirname, 'dist') // 出口文件放在哪个文件夹下
  },
  module: { // 管理资源 
    rules: [
      { // 因为webpack只支持js，所以vue文件，css，img等类型的文件需要loader来进行处理
        test: /\.vue$/, 
        loader: 'vue-loader',
        // use: 'vue-loader'
      },
      {
        test: /\.css$/,
        // css-loader是处理css文件，最终还需要将css写到html中，还需要style-loader
        // 这个{}所包含的内容会将css生成一段js代码，然后写到html中
        // 这个是从右向左，从上到下进行加载
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx$/,
        use: ['babel-loader']
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            // url-loader: 是将文件转成base64位然后写入代码中；这个可以减少http请求
            // file-loader: 是将文件以一个新的文件名存入到一个新的地方
            // 安装url-loader依赖的时候需要安装file-loader，因为url-loader是依赖于file-loader的
            loader: 'url-loader',
            options: {
              limit: 1024, // 限制文件大小
              name: '[name].[ext]' // name: 文件名 ext: 扩展名
            }
          }
        ]
      },
      // less-loader处理后给css-loader处理，css-loader再给style-loader处理
      // css预处理器--less
      {
        test: /\.less$/,
        use: [ 
          'style-loader', 
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              // 加上这个可以复用less-loader生成的sourceMap,这个可以提高编译效率
              sourceMap: true
            }
          },
          'less-loader' 
        ]
      },
      // css预处理器--scss
      // 安装sass-loader时需要安装node-sass，因为sass-loader是依赖于node-sass的
      // {
      //   test: /\.scss$/,
      //   use: [ 
      //     'style-loader', 
      //     'css-loader',
      //     {
      //       loader: 'postcss-loader',
      //       options: {
      //         sourceMap: true
      //       }
      //     },
      //     'sass-loader' 
      //   ]
      // },
      // css预处理器--stylus
      {
        test: /\.styl(us)$/,
        use: [ 
          'vue-style-loader', 
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              // 加上这个可以复用less-loader生成的sourceMap,这个可以提高编译效率
              sourceMap: true
            }
          },
          'stylus-loader' 
        ]
      },
    ]
  },
  // 在配置中添加插件
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      // vue或者react会根据不同的环境生成不同的打包源代码，在开发环境中打包的源代码中会包含有很多错误信息，文件很大
      // 在生产环境中我们是不需要这些错误信息的，webpack在生产环境下不会将这些错误信息打包进去
      // 为啥是这样写： '"development"'
      // 因为：若只写一个''，在调用的时候就会变成process-env.NODE_ENV = development,所以需要加上个""
      'process-env': {
        NODE_ENV: isDev ? '"development"' : '"production"'
      }
    }),
    new HTMLPlugin() // 生成一个html作为项目的页面
  ]
}
// 判断一下运行环境，不同的环境，配置也不一样
if (isDev) {
  config.module.rules.push(
    {
      test: /\.scss$/,
      use: [ 
        'style-loader', 
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true
          }
        },
        'sass-loader' 
      ]
    }
  )
  // 帮助在页面上调试代码，因为浏览器上的代码都是经过编译的，加上这个，可以让我们准确的找到要调试的代码的位置，且浏览器上的代码依然是我们自己写的代码
  config.devtool = '#cheap-module-eval-source-map'
  config.devServer = {
    port: '8000',
     // host设置成0.0.0.0，可以通过localhost、127.0.0.1、本机的内网IP访问；且别人的电脑也可以通过ip来访问自己的电脑
     // 若设置成localhost，则不能通过ip来访问
    host: '0.0.0.0',
    // host: 'localhost',
    overlay: {
      errors: true // webpack在编译过程中有任何错误都会显示在网页上
    },
    hot: true // 热加载 --设置这个，vue只会重新渲染有改动的组件，而不会整个页面重新渲染
  }
  config.plugins.push(
    // 模块热替换
    new webpack.HotModuleReplacementPlugin(),
    // 减少一些不必要的信息展示，在编译出现错误的时候，可以确保输出资源不会包含错误
    new webpack.NoEmitOnErrorsPlugin()
  )
} else {
  config.entry = {
    app: path.join(__dirname, 'src/index.js'),
    vendor: ['vue']
  }
  config.output.filename = '[name].[chunkhash:8].css'
  config.module.rules.push(
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      })
    }
  )
  config.plugins.push(
    new ExtractTextPlugin('styles.[md5:contenthash:hex:8].css'),
    new webpack.optimize.SplitChunksPlugin({ // commonchunkplugin在webpack4中已被移除
      vendor: {
        name: 'vendor'
      }
    }),
    new webpack.optimize.RuntimeChunkPlugin({
      name: 'runtime'
    })
  )
}
module.exports = config