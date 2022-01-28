# Android Studio Bulid Failed

>Update: 2016-01-26 11:53:58

好久没更新了

给自己做个记录吧

最近在xubuntu上配置开发环境

在最后一步编译时候一直如下报错

    Cannot run program "~/Android/Sdk/build-tools/23.0.2/aapt": error=2 找不到此文件或目录"

于是就google了一下

很简单一句搞定
    
```shell
sudo apt-get install lib32stdc++6 lib32z1
```