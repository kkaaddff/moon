## 公共词汇



店铺:shop
员工:employee
商品:goods
订单:trade
工作台:bench
框架:frame
角色:role



## start

```shell

# 安装环境
npm install

#本地开发
npm run start

#打包上线
npm run build prod

```

## 常见问题

### 避免../../../访问:

要设计路径映射,设计 ts 与 babel 两个即可.

1.  ts-config.json

```
    "paths": {
      "uikit/*": ["./uikit/*"],
      "@/*": ["./*"],
      "components/*": ["./components/*"],
      "webapi/*": ["./webapi/*"]
    },
```

2.  .babelrc

```
  "plugins": [
    ["module-resolver", {
      "root": ["./src"],
      "alias": {
        "@/redux": "redux",
        "@/pages": "pages"
      }
    }]
  ]
```
