# 如何修改hosts文件

>Update: 2013-03-01 10:32:32

**如何修改hosts文件**

<font color=red>新手学习向，有炒冷饭的嫌疑，高手请自动略过</font>

由于众所周知的原因，很多网络需要科学上网，

而科学上网最简单最快速的方式就是修改hosts

修改hosts的好处

* 绕过dns投毒
* 访问部分已死域名未死IP的网站
* 能防止关键字重置

具体就不详细说了 反正就是居家旅行、杀人越货、谋财害命之必备佳品。。(￣ε(#￣)大误

**1. 修改windows的hosts**

1. 下载最新可用的hosts [右键猛击我另存为...](http://smarthosts.googlecode.com/svn/trunk/hosts)
	此hosts文件来自[smarthosts项目](https://code.google.com/p/smarthosts/)
	保存时候注意保存类型为：**所有文件** 文件名为:**hosts**如图:
	![houfukudeimg.appspot.png](https://s2.loli.net/2022/01/28/enlIWdTDR5ZHOxP.png)
1. 打开我的电脑(win7为计算机)定位到`C:\Windows\System32\drivers\etc`
	![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/BR4AyiD1TdEcI5x.jpg)
	**回车确认**
1. 拖拽刚才下载的hosts文件到C:\Windows\System32\drivers\etc 覆盖原来的hosts文件
	如果是win7会有如图提示: 选择**复制和替换** 或者 **移动和替换**
	![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/a5dNkVLUOn4Gtsr.jpg)


**2. 修改android设备中的hosts**
<font color=red>!!!!!确保你android设备已经正常root</font>

* 方法一: 全自动软件修改 推荐使用 [smarthost(酷安下载)](http://m.coolapk.com/apk/4680/) 以及 [一键Host(play商店)](https://play.google.com/store/apps/details?id=com.zhai.host&feature=search_result#?t=W251bGwsMSwyLDEsImNvbS56aGFpLmhvc3QiXQ..)

* 方法二: 手动修改 

1. 下载hosts文件 [右键猛击我另存为...](http://smarthosts.googlecode.com/svn/trunk/mobile_devices/hosts)
		 
2. 覆盖android系统根目录/etc/hosts 你可能需要[ROOT EXPLORER](http://m.coolapk.com/apk/1229/) 


**3. 修改linux(其他类linux系统)的hosts**

1. 下载hosts文件`wget https://smarthosts.googlecode.com/svn/trunk/hosts`
1. 覆盖linux系统根目录/etc/hosts `sudo mv hosts /etc/hosts`
