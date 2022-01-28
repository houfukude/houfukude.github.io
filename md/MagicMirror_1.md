# 魔镜项目_1_软件部分

>Update: 2016-03-15 19:55:46

最近看到国外很火的魔镜项目，于是fork了一下github上最火的那个

https://github.com/MichMich/MagicMirror

然而人家是用PHP实现的，而且所有的配置都在config.js里面

于是决定自己改造一个，去掉PHP的特性相关，直接用HTML+CSS+JS来实现，

数据存储在老张的建议下使用了localstorage，嘛！现代浏览器都是支持的。

于是就撸了一个雏形出来

请用力的戳这里 http://blog.houfukude.tk/MagicMirror/

## 主界面
![https://houfukudeimg.appspot.com/f/5z/?w=500](https://houfukudeimg.appspot.com/f/5z/?w=500)

## 设置界面说明

![https://houfukudeimg.appspot.com/f/60/?w=500](https://houfukudeimg.appspot.com/f/60/?w=500)


## 设置相关

需要去  [openweathermap](http://openweathermap.org/api) 申请一个APPID

然后填入你想订阅的新闻的RSS订阅地址

点击 `SAVE` 

好了 一个定制的魔镜界面就完成了！

>Update: 2022.01.28

看了一下 RSS 的服务死了 有机会再修吧
