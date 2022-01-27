# Openwrt 个人记录

## 关于来源

>固件源码 ：  
https://github.com/immortalwrt/immortalwrt 


>固件下载地址 :  
https://downloads.immortalwrt.org/

>Telegram 更新频道  
https://t.me/ctcgfw_project_openwrt

## 当前版本：竞斗云  `21.02`



## 当前版本：星际宝盒 `18.06`

<font color=orange>**⚠️ 注意**</font> 18.06 有 WIFI 接入点暂时满载 的问题


## 简易教程

### 1. 刷入固件

![](https://www.huakings.cn/zb_users/upload/2019/11/201911211574300324444670.jpg)

### 2. 安装插件

配置网络和SSH后 通过SSH登入路由器

#### 1. 更新源

> opkg update

```
Downloading https://mirrors.vsean.net/openwrt/snapshots/targets/ipq40xx/generic/packages/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_core
Downloading https://mirrors.vsean.net/openwrt/snapshots/targets/ipq40xx/generic/packages/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/base/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_base
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/base/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/targets/ipq40xx/generic/kmods/5.10.87-1-7f732dd53389423dd0db8697056dbae6/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_kmods
Downloading https://mirrors.vsean.net/openwrt/snapshots/targets/ipq40xx/generic/kmods/5.10.87-1-7f732dd53389423dd0db8697056dbae6/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/luci/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_luci
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/luci/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/packages/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_packages
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/packages/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/routing/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_routing
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/routing/Packages.sig
Signature check passed.
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/telephony/Packages.gz
Updated list of available packages in /var/opkg-lists/immortalwrt_telephony
Downloading https://mirrors.vsean.net/openwrt/snapshots/packages/arm_cortex-a7_neon-vfpv4/telephony/Packages.sig
Signature check passed.
```

<font color=Aqua>**💬 提示**</font> 本固件最大的特色在于通过自定义的源，几乎可以安装所有常用的软件包


#### 2. 搜索插件

> opkg find \*unblockmusic\*

结果如下 

```
luci-app-unblockmusic - 2.3.5 - LuCI support for Unblock NeteaseCloudMusic
luci-i18n-unblockmusic-zh-cn - git-21.180.30195-713fcb8 - Translation for luci-app-unblockmusic - 简体中文 (Chinese Simplified)
```

<font color=Aqua>**💬 提示**</font>  按需要自行更换 `unblockmusic` 为其他你所需要的关键字

#### 3. 安装插件

> opkg install luci-i18n-unblockmusic-zh-cn

结果如下 
```
Installing luci-i18n-unblockmusic-zh-cn (2.3.5-10) to root...
Downloading ...
Installing luci-app-unblockmusic (2.3.5-10) to root...
Downloading ...
Configuring luci-app-unblockmusic.
Configuring luci-i18n-unblockmusic-zh-cn.
```

<font color=Aqua>**💬 提示**</font>  安装 `luci-i18n-******-zh-cn ` 会自动寻找并安装对应的 `luci-app-******`

#### 4. 自用插件

1. 安装zsh
>opkg install wget unzip zsh ca-certificates

设置默认

>which zsh && sed -i -- 's:/bin/ash:'`which zsh`':g' /etc/passwd


<font color=Aqua>**💬 提示**</font> 通过删除 /etc/config/adblock 可以清理luci

2. ssrp

>opkg install luci-i18n-ssr-plus-zh-cn

3. 解锁网易云灰色歌曲

>opkg install luci-i18n-unblockmusic-zh-cn

<font color=Aqua>**💬 提示**</font> 21.02
>opkg install UnblockNeteaseMusic-Go

<font color=Aqua>**💬 提示**</font> 18.06
>opkg install UnblockNeteaseMusicGo

<font color=Aqua>**💬 提示**</font>  屏蔽 hosts中 163部分


4. HASS需要的RPC

>opkg install luci-mod-rpc

<font color=Aqua>**💬 提示**</font> 18.06 需要修改os-release
```
# cat /etc/os-release | grep VERSION_ID
# Try to edit nano /etc/os-release `VERSION_ID` and replace snapshot with `18.06.2`.
```
5. KMS 服务器

>opkg install luci-i18n-vlmcsd-zh-cn

6. 微信推送

>opkg install lm-sensors

>opkg install luci-app-serverchan


7. 动态DNS

>opkg install luci-i18n-ddns-zh-cn

```
<font color=Aqua>**💬 提示**</font> 21.02

opkg install ddns-scripts_dnspod

<font color=Aqua>**💬 提示**</font> 18.06

opkg install ddns-scripts-dnspod
```


8. 主题

>opkg install luci-theme-argon

9. openclash

>opkg install luci-app-openclash

10. coremark

>opkg install coremark

11. 访问控制

>opkg install luci-i18n-accesscontrol-zh-cn

12. PASSWALL

>opkg install luci-app-passwall

>opkg install simple-obfs

>opkg install v2ray-plugin


#### 5. 更新插件

> opkg update && opkg list-upgradable |awk '{print $1}' |xargs -r opkg install

<font color=orange>**⚠️ 注意**</font> 该命令会一口气更新所有的软件包，如有特殊需求请手动 `opkg list-upgradable` 更新