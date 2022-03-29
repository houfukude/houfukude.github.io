# 我的智能家居解決方案

> Update 2022-03-30 00:41:35 [WIP]

## 控制中枢

-   Home Assistant

    > Home Assistant 是一個智能家居系統，可以讓你的家裡自動化，讓你的家裡更加安全。

    Home Assistant 是我的解决方案的核心部分。是数据中心，也是控制中心。

    [home Assistant 官方文档](https://www.home-assistant.io/docs/)

    安装很多方案：

    1. 可通过树莓派刷入 `hass.io`
    2. 随便找个 arm 板，直接 python 安装
    3. 随便找个 linux 环境，通过 docker 安装
    4. 随便找个 linux 环境，直接 python 安装

    我使用的是第四个方案。

    Home Assistant 提供了相当多的第三方插件可供选择，详细可在 [官网/集成](https://www.home-assistant.io/integrations/) 中查看。

    同时，还有社区维护的 [HACS](https://hacs.xyz/) (Home Assistant Community Store)，可以让你自己添加插件。

    ![HA.png](https://s2.loli.net/2022/03/30/KNpE2QChdazU8vi.png)

## 家庭照明

1. BroadLink WiFi 智能插座 `SP mini 3`

    > 博联的这个产品是一个智能插座，可以通过网络控制家庭电路。

    此物绝对是小白初次体验智能家居不二之选。入门有自家 APP 傻瓜化控制简单，进阶有完整的各类模块无缝对接。

    在 Home Assistant 中有对应的模块 `Broadlink` 。

2. ESP32 & ESP8266

    > 乐鑫科技家的两款 MCU，通过刷入 `esphome` 固件配合 **继电器模块** 可用直接的灯光等各类电源管理。

    [esphome 官网](https://esphome.io/)

    <font color=orange>**⚠️ 注意**</font> 涉及强电操作，只做理论积累，未做安全性验证！

    在 Home Assistant 中有对应的模块 `ESPHome` 。

3. ESP8266 + WS2812B

    > 通过直接刷入 `WLED` 可以控制灯光。

    [WLED Project](https://kno.wled.ge/)

    在 Home Assistant 中有对应的模块 `WLED` 。

## 天气与温度

1. met.no

    > 提供全球天气预报，温度，湿度等数据。

    [met.no 官网](https://www.met.no/en/)

    在 Home Assistant 中有对应的模块 `Metno` ,只需要配置经纬度，就可以获得天气信息。

    其中不同数据的变化，可用于各类事件触发，比如：打雷下雨收衣服（笑

2. 空气质量预测 `AirVisual`

    > 空气质量预测，可以查看家庭环境的空气质量，比如空气质量指数，空气质量指数等等。

    在 Home Assistant 中有对应的模块 `AirVisual` ，只需要申请一个 free 的 API 就可以使用，非常方便！

3. ESP32 + DHT11 & DHT22

    > 只有 ESP32 带蓝牙 BLE，DHT 系列则是温湿度感应器

    这里我同样刷入 `ESPHome` 固件，并启用了 `xiaomi_ble` 模块，为下面的小米温度计做准备。

4. 小米温湿度计 `LYWSD03MMC`

    > 小米温湿度计，可以查看家庭环境的温度，湿度，空气质量等等。有蓝牙广播，可以在`ESPHome` 固件中直接连接。

    详细可用参考 [esphome 官网](https://esphome.io/) 的文章 [xiaomi_ble](https://esphome.io/components/sensor/xiaomi_ble.html)

## 空调 & 空气净化

1. BroadLink 黑豆 WiFi 遥控器 `RM mini 3`

    > 博联的这个产品是一个红外控制器，可以通过网络控制各类红外设备。

    和之前的那个智能插座一样，自家 APP 傻瓜化控制简单，进阶有完整的各类模块无缝对接。

    同样，在 Home Assistant 中有对应的模块 `Broadlink` 。

    <font color=green>**ℹ️ 提示**</font> 这是最简单的控制空调，电视，等各类红外设备的方案。只是红外也有天生不足，无法穿墙！！！所有如果要做全屋方案就要考虑是否每个房间都要安排一个。

2. SmartIR

    > 是用于通过红外控制器控制空调、媒体播放器和电风扇的自定义集成。

    [官网 github/SmartIR ](https://github.com/smartHomeHub/SmartIR)

    最早听说在 Home Assistant 中是有对应的模块的。后来不知道怎么搬家去了 HACS，可用手动安装， 也可以使用 `HACS` 安装

3. 各家空调随便选（除非没遥控器）

4. 支持红外的其他设备，比如空气净化器还有电风扇等

## 语音控制

-   Google Assistant

todo: 这个有点麻烦以后再补充，后面也很麻烦之后再说

## 设备追踪

1. OpenWRT `luci`

2. MoblieApp

## 视频监控与报警

1. Android IP Webcam

2. doods

## 其他

1. MQTT

2. HomeKit

3. Panel

## 参考文献

-   [智能家居和 home assistant](https://blog.colors4.us/zhi-neng-jia-ju/)

-   [智能家居之实践篇](https://blog.yxwang.me/2017/10/smart-home-2/)
