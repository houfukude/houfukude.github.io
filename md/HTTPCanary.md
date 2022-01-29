# HTTPCanary 折腾记录

>Update: 2022-01-29 00:00:00

## 前言

`Android 11+` 以后 CA 证书的权限,进行了修改 (更加严格了

在 `Android 7-10` 可以直接使用软件自带的

HTTPCanary 已经好久没更新了.据说作者已经不再更新,目前使用的最新非破解版为 `v3.3.6` 并没有对 `Android 11+` 进行适配.  

在查阅了一些资料后发现可以通过手动安装的方式,绕过检测实现 `HTTPS` 抓包

参考链接1. https://www.cnblogs.com/ercilan/p/14386362.html

参考链接2. https://www.jianshu.com/p/fb2b52f77ff4

参考链接3. https://legalwyy.com/archives/318

## 操作过程

> 这里使用的是 `root explorer` 这款文件管理器

1. 获取证书
    
    首先在 `HTTPCanary` 中尝试安装证书, 得到的结果 <font color=red>安装失败</font>

    在 `/data/data/com.guoshi.httpcanary/cache/` 目录下找到 `HttpCanary.pem`

    复制一份到 `Donwload` 目录
    
2. 安装证书
    
    接着进入 设置 -> 安全 -> 加密与凭证 -> 安装证书 -> CA 证书 

    > PS 我这里使用的是 Pixel 4 ,其他手机系列操作路径或许有些许不同

    然后在弹出的系统文件管理器中选择刚才复制出来的 `HttpCanary.pem` 选择安装

3. 绕过验证

    打开 `root explorer` 重新访问到 `/data/data/com.guoshi.httpcanary/cache/` 在目录下建立一个 `HttpCanary.jks` 的空文件, 设置权限 `600` 
    
    >PS 到这里 非root设备 的折腾就到此为止了 目前我使用的 root 方案为 Magisk + LSPosed

4. 系统证书 <font color=orange>需root</font>

    `Android 11+` 默认不在信任用户证书 第二步里面的安装 只能抓一些很基础的 HTTPS,如果要进行进一步的抓包, 就只能先 `root` 设备了. 接着在 Magisk 库里搜索安装 [Move Certificates](https://github.com/Magisk-Modules-Repo/movecert) 模块

5. 解决应用证书绑定 <font color=orange>需root</font>

    下载并安装 [TrustMeAlready](https://github.com/ViRb3/TrustMeAlready/releases) ,并在 LSPosed 中启用并勾选需要抓包的应用.