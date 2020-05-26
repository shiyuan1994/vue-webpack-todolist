// 该文件是用来后处理css的，通过把less或scss文件编译成css文件后，再通过其来优化代码，通过一系列的组件进行优化
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    // 用于给css属性加浏览器前缀的，如：-webkit-box-shadow等
    autoprefixer()
  ]
}