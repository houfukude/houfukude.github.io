# 电信 TY1608 Armbian 折腾踩坑日志

> Update: 2025-07-21 14:16:22

## 设备信息 

* 中国电信 - 重庆
* SOC: [S905L3B]
* Model: [TY1608 非高安版 无WIFI 阉割版 1G + 8G]
* DRAM: [GDQ2BFAA-CE ] x2
* OS: Android 4.4.2

初始系统是电信IPTV定制系统

## 准备工作

* USB 公对公线
* U盘
* tf卡 - 用于扩充 docker 空间
* USB-TTL 串口下载器
* TTL 驱动 - 我的是 CP210x
* 晶晨USB_Burning_Tool_v2.2.0.zip
* rufus-4.6.exe
* PuTTY.exe
* https://github.com/ophub/amlogic-s9xxx-armbian

## 刷机过程

参考教程 https://github.com/ophub/amlogic-s9xxx-armbian/blob/main/documents/README.cn.md

### 1. 拆机 

四个螺丝拆开,取出主板,找到主板背面的 4R12 电阻

>踩坑 : 我这个版本没有主板丝印 查了一些网上的刷机资料 

发动俺寻思之力 然后应该是背面的这个了

### 2. 刷入 Android 9 系统包 (线刷)

打开 USB_Burning_Tool_v2.2 

导入 Android 9 的 线刷固件 android_tv_ty1608_s905l3b.tar.xz

`此版本的 Android 无法正常启动只能用于救砖`

下载地址: https://github.com/ophub/kernel/releases/download/tools/


>踩坑 : 不能用最新的 3.2 , 无法正常读取镜像

>踩坑 : 刷机到1%出错, 保持短接 4R12 电阻直到进度跳到7%的时候再放开

### 3. 刷入 armbian

步骤 0️⃣：接入 TTL 

由于主板没有丝印, 用万用表找到 GND , 然后用通电,查看触点有电压变化(输出数据) 就是 TX , 剩下的电压恒定的就是 VCC , 最后一个就是 RX .

![Snipaste_2025-07-21_19-28-46.png](https://s2.loli.net/2025/07/21/ZDcPnOxLi92RNAq.png)

然后接上 USB-TTL 串口下载器, 电脑上打开 PuTTY 选择串口通信

>踩坑 : 不可接 VCC 

>踩坑 : TX 和 RX 和 TTL 上的是相反的

步骤 1️⃣: 使用 Rufus 制作启动盘 

>踩坑 : 6.12.35 会无限重启 U-BOOT 无法引导

>踩坑 : 6.1.142 有线网卡驱动有问题

在尝试了各个内核版本的镜像后,最终选择了 

`Armbian_HassIoSupervisor_bookworm_save_2025.07` -> 
`Armbian_25.08.0_amlogic_s905l3b_bookworm_5.15.186_server_2025.07.01.img.gz`

步骤 2️⃣: 插入U盘 通电开机 (`实测` 两个 USB 口都可以)

正常情况下就可以 通过 PuTTY 看到内核信息, 启动成功后就可以进行 armbian 的一些初始化设置

步骤 3️⃣：安装 armbian 到 EMMC

>踩坑 : 部分版本无法通过 EMMC 启动 找不到 U-BOOT,使用 6.1.xxx 内核的镜像 [issues#3031](https://github.com/ophub/amlogic-s9xxx-armbian/issues/3031)

>踩坑 : 测试网络正常后建议拔掉网线, 否则这个 Home-Assistant 会初始化 docker 并下载安装一系列的 docker 镜像,增加安装的数据量 (时间长,而且容易爆存储)

```bash
armbian-install
```

安装成功后

```bash
poweroff
```

接着拔掉U盘,重新上电开机


### 4. 迁移 docker 到 tf 卡

步骤 0️⃣：停用并清除 Home-Assistant

由于我是下载的 带 HA 的 armbian 但是现在内部空间又不够直接跑 docker 

需要先清理 重新软链接 docher 再重新安装 Home-Assistant

```bash
armbian-config
```

通过 对话框 定位到
Software -> HomeAutomation -> HAS002 - Home Assistant remove (http://:8123)

分别执行一次 `HAS002 - Home Assistant remove (http://:8123)` 和 `HAS003 - Home Assistant purge with data folder`

步骤 1️⃣：停止 Docker 服务

```bash
sudo systemctl stop docker
```

步骤 2️⃣：复制整个目录

```bash
sudo rsync -aHAXx /var/lib/docker/ /mnt/data/docker/
```

步骤 3️⃣：备份并清空原始目录

```bash
sudo mv /var/lib/docker /var/lib/docker.bak
```

步骤 4️⃣：创建软链接

```bash
sudo ln -s /mnt/data/docker /var/lib/docker
```


步骤 5️⃣：修复权限（很关键）
```bash
sudo chown -R root:docker /mnt/data/docker
```

步骤 6️⃣：启动 Docker 并验证

```bash
sudo systemctl start docker
docker images
docker ps -a
```

（可选）清理旧数据

```bash
sudo rm -rf /var/lib/docker.bak
```

这是我最后处理后的效果
![Snipaste_2025-07-21_18-46-11.png](https://s2.loli.net/2025/07/21/HDK2BemzAZjJGT3.png)

### n. 配置 Home Assistant

```bash
armbian-config
```
Software -> HomeAutomation -> HAS002 - Home Assistant 

>踩坑 : 1G RAM 还是太小了 跑完整的 Home Assistant 会爆内存卡死

>踩坑 : docker的好多东西都吃内存 1G RAMMMMMM!!!
