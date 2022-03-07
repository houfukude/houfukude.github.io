# Deadbeef 支持 GBK 的 patch 记录

> Update: 2012-10-30 10:50:18

`xxx.patch` 文件到用法：

```
patch -Np1 -i xxx.patch
```

## 首先搭建环境

```
sudo apt-get install libasound2-dev libpulse-dev libwavpack-dev libsndfile1-dev libcdio-dev libcddb2-dev automake libtool libsamplerate0-dev libgtk2.0-dev libavformat-dev libcurl4-gnutls-dev libdbus-1-dev libfaad-dev libmms-dev intltool libmad0-dev
```

> PS: libmad0-dev 在 ubuntu.srt.cn 源上是 404 not found 所以在 [mirrors.163.com](http://mirrors.163.com/ubuntu/pool/universe/libm/libmad/libmad0_0.15.1b-7ubuntu1_i386.deb) 下载

## 下载源码

[deadbeef-0.5.6-src](http://sourceforge.net/projects/deadbeef/files/deadbeef-0.5.6.tar.bz2/download)

## 下载补丁

[junklib.patch.tar.gz](http://forum.ubuntu.org.cn/download/file.php?id=119731&sid=564a50c2634598a028a566ff34dd0432)

## 打补丁

```
patch -Np1 -i junklib.patch
```

## 编译代码

```
cd deadbeef-0.5.6
./configure
make
```

## 安装

```
sudo make install
```

## 打包

安装 checkinstall

```
sudo apt-get install checkinstall
```

使用 checkinstall 进行打包

```
sudo checkinstall
```

然后一路回车就好了

这是我打包的：
[deadbeef-0.5.6-i386-gbk.deb](http://file.houfukude.tk/13001-deadbeef_0.5.6-1_i386.deb)

## 关于自己打包 deadbeef 不能播放 ape 的问题

由于 ape 编码非开源最好的解决方案就是下载编译好的

ape 编码支持文件 [ffap.so_for_deadbeef-0.5.6](http://file.houfukude.tk/13002-ffap.so)

用法:

```
sudo mv ffap.so /usr/local/lib/deadbeef
```

> Update: 2022.01.28

本文写于 2012-10-30 使用的 x86 架构的 xubuntu12.10 这里仅内容转移,并未实际验证

参考帖子：http://forum.ubuntu.org.cn/viewtopic.php?t=303365

目前文中提供的下载已经无法下载了
