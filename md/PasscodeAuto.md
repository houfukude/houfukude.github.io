# PasscodeAuto

> Update: 2013-01-17 19:53:41

一个可以自动提交 Ingrss Passcode 的 GAE 程序。

程序通过 GAE 抓取 G+上的 passcode 然后通过 cookies 自动提交 ingress

达到无人值守提交 passcode 适合广大国内时区差党 ╮(￣ ▽ ￣)╭

<font color=red> ！！！再次声明：自动提交属于作弊行为 请三思而行！！！</font>

<font color=red> ！！！因为谷歌修复服务器导致 PasscodeAuto 已经失效！！！</font>

1.  下载 PasscodeAuto [下载地址](https://code.google.com/p/kissshell/downloads/list?can=1)
1.  本地安装 python2.7([下载地址](http://python.org/getit/))环境 和 Google App Engine Launcher for Python ([下载地址](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python))
    (PS：建议安装时勾选上加入环境变量)
1.  GAE 创建一个新的 application，相信网上很多教程这里就不覆述了
1.  修改 app.yaml 中的 your-app-id 为刚才创建的 application 的 id
1.  V1.3 新增邮件提示功能: #指定邮箱进行接收邮件提示,如果为空则不发送邮件提示
    EMAIL=''
1.  访问[https://code.google.com/apis/console](https://code.google.com/apis/console) 创建一个 projects，然后在 Services 栏下找到 Google+ API 并 Activate
1.  然后在 API Access 里找到 API key，修改 ingress.py 中：

        # G+ API key visit https://code.google.com/apis/console/
        key = '填写你的g+ API key'

1.  接下来登录[http://www.ingress.com/intel](http://www.ingress.com/intel)，
    在网页上地图以外的地方点击右键>审查元素(N)>Resources>Cookies>www.ingress.com
    找到 csrftoken 和 ACSID，修改 ingress.py 中的相关字段：
            # http://www.ingress.com/intel cookie ACSID
            acsid = '填写你通过浏览器获得的ACSID'
            # http://www.ingress.com/intel cookie csrftoken
            csrftoken = '填写你通过浏览器获得的csrftoken'

（PS：要说明的是 ACSID 是很长很长的 狂点击几次 ACSID 的 Value 然后复制吧 ╮(╯▽╰)╭ 看图 ）
![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/fryaLiFJjbwx3q8.jpg)

1. 上传 GAE。请使用命令行的 `appcfg.py update PasscodeAuto/ `
   （PS：由于没使用 GAE 官方的 webapp 而是使用的 web.py 请一定使用 appcfg.py 上传,经测试 goagent 的上传模块无法上传 cron.yaml 这会导致无法自动获取和提交。也就是说你得手动了(=￣ ω ￣=)）

1. 等待五分钟，检查 GAE 后台 Data 下 Datastore ViewerZ 中的 results 就可以看到提交结果。
   （表打我 对于国内的大众来说 访问https://appengine.google.com/比 访问*.appspot.com 简单吧 []~(￣ ▽ ￣)~*　 ）

关于本地调试的说明： 经测试 GAE Launcher 无法调试，应该也是因为使用的是 web.py 的原因 所以请使用` dev_appserver.py PasscodeAuto`

> 20120118 更新：

关于报错，暂时没有解决，一般只有在提交正确了之后才会程序性的 error 我也不知道什么原因，反正能正确提交就 OK

> 20130119 更新：

1. 添加了https://plus.google.com/u/0/100593696770419986561/posts/4NUDG6dMUHZ
   上的 type2 和 type3 格式的 passcode

2. ingress.py 采用 UTF-8 编码格式

3. 修改业务逻辑，提交失败后 passcode 不会存储

4. 添加 update.bat 和 dev_appserver.bat
   在本地已经有 python 和 GAE 时，并自动添加环境变量时用于上传和二次开发

> 20130120 更新：

1. 根据 Logs 里面的 BadValueError 修改 resluts 的数据类型为 txt.目测提交正确后也有显示
   (PS：我也是才发现,不知道可行不 不可行的话就没办法了 不要打我～～)

> 20130121 更新：(V1.1 的 bug 已经修复 恢复下载)

1. 重新 result,可以在 Datastore View 直观查看推送结果(建议更新后清空 passcode 和 results 中的所有数据)
2. 决定放弃多用户同时推送，GAE 的免费配额太蛋疼了
   ![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/D2O4j6gxCyasiep.jpg)

    > 20130124 更新:

3. 继续优化 results 显示的结果 (采用 Gemoo 的提供方案https://github.com/GeMoo/Temp/blob/master/PasscodeAutoV1.2_items_time_display.py)
4. 显示提交时间
5. 新增邮件提示 可以进行及时的邮件通知。
6. 增强安全性，只有管理员权限才能执行手段抓取 /auto
7. 主页实现当前 G+五分钟内 passcode 显示 （感谢[+D KWOKWO](https://plus.google.com/u/0/100677208124371524293/posts)友情 UI 设计）

然后就是喜闻乐见的下载地址[PasscodeAuto](http://code.google.com/p/kissshell/downloads/list?can=1)

最后的最后 感谢 shizhao 的 [passcode.py](https://gist.github.com/4528587) 以及 [小孩](https://ssl.xiaohai.co/)还有强大的 GAE

> Update: 2022.01.28

G+ 已死

Ingress 早已进入 prime 时代

此项目仅作记录
