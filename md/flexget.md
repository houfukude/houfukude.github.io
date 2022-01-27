# 关于 `flexget` 的使用指北

>更新于 2020.5.5 17:55

`flexget` 使用备忘, 防老年痴呆的自我记录罢了

## 0 什么是flexget

FlexGet 官网是这样描述自己的，媒体文件的多功能自动化工具。可以支持 torrents, nzbs, podcasts, comics, TV, movies, RSS, HTML, CSV, 等等作为输入。FlexGet 是 Python 编写的，所以如果想要实现更加复杂的功能，也可以自己写脚本来处理。

FlexGet 一大被称道的就是可以实现 PT 或者 BT 的自动下载，并且直接传给 Deluge, transmission, uTorrent, rTorrent, SABnzb 等等客户端进行下载。FlexGet 也集成了 trakt, thetvdb.com, imdb.com 等等网站可以用来追踪剧集。

FlexGet 可以自定义任务，自定义运行时间，有一个友好的 Web 界面，然后还有很多很多有待发现的功能。

>引用来源 http://einverne.github.io/post/2020/02/flexget.html

## 1. 配置

> nano -w /home/houfukude/.flexget/config.yaml

```yaml
# 主要是记录 aria2 的账号密码
variables: secret.yaml
# 当然这个 web 也没啥用 问题还多 UTC+0 的事件就不说了
web_server: 
  web_ui: no
# 不使用内置的 用 cron 代替
schedules: no
## 主要是这里
task:
  ## 嗯 是什么呢 (*^_^*)
  dsndsht23:
    ## 来自大佬们的爱的结晶 更多可以 去 https://docs.rsshub.app/ 了解
    ## code 可以通过 URL 传参 精准查找
    rss: https://rsshub.app/dsndsht23/103/480?filter=$code
    ## 既然都精准查找了 当然照单全收了
    accept_all: yes
    ## aria2 下载相关的配置
    aria2:
      server: '{? aria2.server ?}'
      port: '{? aria2.port ?}'
      secret: '{? aria2.secret ?}'
      ## 这里我通过不同的目录做到了资源类型的区分
      path: '/mnt/downloads/.downloading/AV/'
  ## 西部世界第三季
  ww.S03:
    ## 直接一个季 追番剧 设定 抓取到新的就 下载
    rss: https://rsshub.app/zimuzu/resource/33701?filter=S03
    accept_all: yes
    ## 当然不是全部下载 mkv 是原片 mp4 是字幕组压制的 所以
    regexp:
      accept:
        - mp4
      reject:
        - mkv
    ## 同上
    aria2:
      server: '{? aria2.server ?}'
      port: '{? aria2.port ?}'
      secret: '{? aria2.secret ?}'
      ## 这里其实可以做得更细致 不过我 aria2complete.sh 里有对应的处理
      path: '/mnt/downloads/.downloading/TV/'
```

说明

    经测试感觉 `flexget` 自带的服务的方式并抓取并不及时

    或许是学艺不精吧 以后机会再折腾吧


## 2. 使用

### 2.1 首先检测配置

> flexget check

结果如下

```shell
2020-05-05 16:12:17.530 | DEBUG    | flexget.tray_icon:<module>:20 - Could not import pystray: Bad display name ""
2020-05-05 16:12:20 VERBOSE  check                         Pre-checked 44 configuration lines
2020-05-05 16:12:21 VERBOSE  check                         Checking config file `/home/houfukude/.flexget/config.yml`
2020-05-05 16:12:21 VERBOSE  check                         Config passed check.
```
### 2.2 查看状态

> flexget status

PS. 我这里因为已经跑了一段时间了 所以有结果

结果如下

```shell
2020-05-05 16:29:12.623 | DEBUG    | flexget.tray_icon:<module>:20 - Could not import pystray: Bad display name ""

┌───────────────┬──────────────────┬──────────────────┬──────────┬──────────┬──────────┬────────┬──────────┐
│ Task          │ Last execution   │ Last success     │ Produced │ Accepted │ Rejected │ Failed │ Duration │
├───────────────┼──────────────────┼──────────────────┼──────────┼──────────┼──────────┼────────┼──────────┤
│ ww.S03        │ 2020-05-05 16:05 │ 2020-05-05 16:05 │ 16       │ None     │ None     │ None   │ 1s       │
│ dsndsht23     │ 2020-03-25 10:52 │ 2020-03-24 19:58 │ 1        │ 0        │ 1        │ 0      │ 1s       │
│ Hanzawa.Naoki │ 2020-05-05 04:30 │ -                │ -        │ -        │ -        │ -      │ -        │
└───────────────┴──────────────────┴──────────────────┴──────────┴──────────┴──────────┴────────┴──────────┘
```

( PS. cli 都画得这么好 还要什么 `web` 什么 `deamon` 啊)

### 2.3 指定任务测试

由于 `dsndsht23` 的画面不太好 所以这里使用 `ww.s03`

>flexget  --test execute --tasks ww.s03

结果如下

```shell
2020-05-05 16:32:37.345 | DEBUG    | flexget.tray_icon:<module>:20 - Could not import pystray: Bad display name ""
2020-05-05 16:32:37 INFO     manager                       Test mode, creating a copy from database ...
2020-05-05 16:32:37 INFO     manager                       Test database created
2020-05-05 16:32:41 VERBOSE  task_queue                    There are 1 tasks to execute. Shutdown will commence when they have completed.
2020-05-05 16:32:42 VERBOSE  details       ww.S03          Produced 16 entries.
2020-05-05 16:32:42 VERBOSE  task          ww.S03          REJECTED: `西部世界.Westworld.S03E08.END.中英字幕.HDTVrip.720P-人人影视.V2.mp4` by seen plugin because entry with url `magnet:?xt=urn:btih:
<hash>` is already marked seen in the task ww.S03 at 2020-05-05 08:40

...

2020-05-05 16:32:42 VERBOSE  task          ww.S03          REJECTED: `Westworld.S03E08.720p.WEB.H264-BTX.mkv` by regexp plugin because regexp 'mkv' matched field 'title'

...

2020-05-05 16:32:42 VERBOSE  details       ww.S03          Summary - Accepted: 0 (Rejected: 16 Undecided: 0 Failed: 0)
2020-05-05 16:32:42 INFO     aria2         ww.S03          Connecting to daemon at https://default.houfukude.home/rpc
2020-05-05 16:32:43 INFO     manager                       Removed test database
```
<font color=orange>**⚠️ 注意**</font>
这里主要测试几个地方

1. 去 `RSSHUB` 抓取是否正常
2. 规则是否正确的执行
3. 下载服务 `aria2` 是否能正常连接


可以看到 `regexp` 的规则有好好的执行 mkv 被剔除了

由于我这执行结果是在已经跑完的机器上,最后一集已经下载. 因此结果为 `REJECTED`

```shell
REJECTED: `西部世界.Westworld.S03E08.END.中英字幕
```

嘛 不要在意这里 反正知道能跑了就行了



### 2.4 学习

以命令执行的时间为准,把已有的资源录入系统并标记不再下载

(PS 由于众所周知的原因有时候我们在执行的时候之前的资源或许已经不再需要下载了)

> flexget execute --learn --tasks ww.s03

执行结果没啥好看的了只有一句需要注意

```shell
2020-05-05 16:48:20 INFO     task          ww.S03          Disabling download and output phases because of --learn
```

### 2.5 完整执行

>flexget execute --tasks ww.s03

每周手动执行一下这条命令,就能抓取并自动添加到下载了

## 3. 定时执行

> crontab -e

添加如下配置

```config
40  */4 *   *   1-2 /home/houfukude/.local/bin/flexget -c /home/houfukude/.flexget/config.yml execute --tasks ww.s03
```

说明

    仅在周一周二每4个小时在40分钟的时候执行 (西部世界第三季周一更新,考虑到rrys的出品速度 emmm)

如果 `crontab` 没啥问题的话 执行的记录 会保存到 `/home/houfukude/.flexget/flexget.log`

同时 crontab 有一个邮件发送的机制 所以 执行失败的结果还会出现在 `/var/mail/houfukude`
