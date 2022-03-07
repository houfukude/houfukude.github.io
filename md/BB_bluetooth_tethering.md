# 黑莓蓝牙共享 nexus7 上网

> Update: 2012-12-31 00:46:07

终于能通过 blackberry 的蓝牙共享网络让我那没有 3G 的 nexus7 终于能够移动上网了。

该方法通用于所以的 android 设备。
前提 1：你的黑莓设备不能打开 wifi 热点。（或者你想通过蓝牙共享节约能耗，其实我也是这样想的）
前提 2：是你的 android 设备已经 root。

1.  首先用蓝牙匹配你的 android 和 blackberry 设备。
1.  之后用黑莓自带浏览器访问 [http://junefabrics.com/bb/](http://junefabrics.com/bb/)下载黑莓蓝牙 dun 客户端
1.  启动 blackberry 上的 pdaNet 开启软件对 blackberry 的蓝牙访问权限，选择 enable Bluetooth DUN。
1.  ios 设备有 ibluever 软件，但是 ibluever 没有 android 版本，
    因此只能找类似的蓝牙 DUN 软交换替代 blueVPN [4.0 系统以下的下载地址](https://play.google.com/store/apps/details?id=com.bluevpn&hl=en)&& [ICS+版本下载地址](https://play.google.com/store/apps/details?id=com.bluexvpn)
1.  启动 blueVPN 选择你的 blackberry 设备 最后再在你的 blackberry 设备上确认连接就 OK。

![houfukudeimg.appspot.png](https://s2.loli.net/2022/01/28/9gi7fH142YWNdTx.png)
不过有一个小问题：这样上网，不能通过任何第三方的流量控制来限制流量。换言之，就是所有 android 设备都能通过这种方式上网。
![houfukudeimg.appspot.png](https://s2.loli.net/2022/01/28/fm8E6gb7cK3L1z5.png)
唉 为了玩 ingress 我豁出去了。右上角的那个红色无数据连接吧。
