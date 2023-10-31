const { name } = require("./package");

const port = 8301;

module.exports = {
  devServer: {
    port,
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_API,
        pathRewrite: {
          "^/api": process.env.VUE_APP_BASE_API,
        },
      },
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd", // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
