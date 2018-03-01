# 选股工具

## 目录/文件结构说明

``` shell
./
|-- src                <<< 插件调试源码目录
|   |-- sources        <<< es6 源码           -- TODO
|   |-- site_modules   <<< 定制化nodejs模块   -- 
|   |-- manifest.json  <<< 插件入口文件
|-- dist               <<< 插件打包目录      
|-- tools              <<< 打包工具           -- TODO
|-- package.json       <<< nodejs 包描述文件  -- TODO
|-- cli                <<< 数据整理工具       -- TODO
|-- webpack.config     <<< webpack 打包配置   -- TODO
|-- releases           <<< 插件各release      -- TODO
```

## 开发步骤

1. `npm install` 安装工程所需要的npm包;
2. `npm run w` 启动webpack-watch功能，监视src/sources目录中的源码实时打包；
  * 在 chrome://extensions/ 中启用“开发者模式”
  * 使用“加载已解压缩的扩展程序”按钮打开src目录；
  * 通过chrome工具栏启动插件；
  * 修改src/sources中的代码->刷新插件页面调试；
3. `npm run d` 打包src/sources目录中的源码到dist中； 


## 数据源


 `http://blog.csdn.net/xp5xp6/article/details/53121481`
 
 * http://img1.money.126.net/data/hs/kline/day/history/2015/1399001.json 
 

# 命令行


## 下载数据
```shell
D:\workspace\stocka>node cli\163_data.js
```
下载的数据保存在 `dat` 目录中.

