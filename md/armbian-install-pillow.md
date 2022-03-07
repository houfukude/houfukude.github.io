# Armbian 安装 Pillow 问题拾遗

为了在小板子上运行某不可描述的 py 脚本,需要用到 Pillow
先上结果:
![https://houfukudeimg.appspot.com/f/65/](https://houfukudeimg.appspot.com/f/65/)

```
python3 -m pip install --upgrade Pillow
```

## 问题 1 找不到 `zlib` :

    The headers or library files could not be found for zlib,
    a required dependency when compiling Pillow from source.

    Please see the install instructions at:
        https://pillow.readthedocs.io/en/latest/installation.html

解决方案

```
sudo apt-get install zlib1g-dev
```

## 问题 2 找不到 `jpeg`:

    The headers or library files could not be found for jpeg,
    a required dependency when compiling Pillow from source.

    Please see the install instructions at:
      https://pillow.readthedocs.io/en/latest/installation.html

解决方案

```
sudo apt-get install libjpeg62-dev
```

不过可能会出现以下情况

    没有可用的软件包 libjpeg62-dev，但是它被其它的软件包引用了。
    这可能意味着这个缺失的软件包可能已被废弃，
    或者只能在其他发布源中找到
    然而下列软件包会取代它：
      libjpeg62-turbo-dev

    E: 软件包 libjpeg62-dev 没有可安装候选

这个时候就按照指引安装替代包

```
sudo apt-get install libjpeg62-turbo-dev
```

然后就可以愉快的安装 Pillow 了

当然如果还有问题可能会用上的

```
sudo apt-get install libfreetype6-dev
sudo apt-get install liblcms1-dev
```
