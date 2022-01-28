# PasscodeAuto

>Update: 2013-01-17 19:53:41

一个可以自动提交Ingrss Passcode的GAE程序。

程序通过GAE抓取G+上的passcode然后通过cookies自动提交ingress

达到无人值守提交passcode 适合广大国内时区差党 ╮(￣▽￣)╭　

<font color=red> ！！！再次声明：自动提交属于作弊行为 请三思而行！！！</font>

<font color=red> ！！！因为谷歌修复服务器导致PasscodeAuto已经失效！！！</font>

1. 下载PasscodeAuto [下载地址](https://code.google.com/p/kissshell/downloads/list?can=1)
1. 本地安装python2.7([下载地址](http://python.org/getit/))环境 和Google App Engine Launcher for Python ([下载地址](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python))
(PS：建议安装时勾选上加入环境变量)
1. GAE创建一个新的application，相信网上很多教程这里就不覆述了
1. 修改app.yaml中的your-app-id为刚才创建的application的id
1. V1.3新增邮件提示功能:    #指定邮箱进行接收邮件提示,如果为空则不发送邮件提示
    EMAIL=''
1. 访问[https://code.google.com/apis/console](https://code.google.com/apis/console) 创建一个projects，然后在Services栏下找到Google+ API 并Activate
1. 然后在API Access里找到API key，修改ingress.py中：
    
        # G+ API key visit https://code.google.com/apis/console/
        key = '填写你的g+ API key'

1. 接下来登录[http://www.ingress.com/intel](http://www.ingress.com/intel)，
在网页上地图以外的地方点击右键>审查元素(N)>Resources>Cookies>www.ingress.com
找到csrftoken和ACSID，修改ingress.py中的相关字段：
    
        # http://www.ingress.com/intel cookie ACSID
        acsid = '填写你通过浏览器获得的ACSID'
        # http://www.ingress.com/intel cookie csrftoken
        csrftoken = '填写你通过浏览器获得的csrftoken'
    

（PS：要说明的是ACSID是很长很长的 狂点击几次ACSID的Value然后复制吧 ╮(╯▽╰)╭ 看图 ）
![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/fryaLiFJjbwx3q8.jpg)

1. 上传GAE。请使用命令行的 `appcfg.py update PasscodeAuto/ `
（PS：由于没使用GAE官方的webapp 而是使用的web.py 请一定使用appcfg.py上传,经测试goagent的上传模块无法上传cron.yaml 这会导致无法自动获取和提交。也就是说你得手动了(=￣ω￣=)）

1. 等待五分钟，检查GAE后台Data下Datastore ViewerZ中的results就可以看到提交结果。
（表打我 对于国内的大众来说 访问https://appengine.google.com/比 访问*.appspot.com简单吧  []~(￣▽￣)~*　 ）

关于本地调试的说明： 经测试GAE Launcher 无法调试，应该也是因为使用的是web.py的原因 所以请使用` dev_appserver.py PasscodeAuto`

>20120118更新：

关于报错，暂时没有解决，一般只有在提交正确了之后才会程序性的error 我也不知道什么原因，反正能正确提交就OK

>20130119更新：

1. 添加了https://plus.google.com/u/0/100593696770419986561/posts/4NUDG6dMUHZ
    上的type2和type3格式的passcode

2. ingress.py采用UTF-8编码格式

3. 修改业务逻辑，提交失败后passcode不会存储

4. 添加update.bat 和 dev_appserver.bat
在本地已经有python和GAE时，并自动添加环境变量时用于上传和二次开发

>20130120更新：

1. 根据Logs里面的BadValueError修改resluts的数据类型为txt.目测提交正确后也有显示
(PS：我也是才发现,不知道可行不 不可行的话就没办法了 不要打我～～)

>20130121更新：(V1.1的bug已经修复 恢复下载)

1. 重新result,可以在Datastore View直观查看推送结果(建议更新后清空passcode和results中的所有数据)
2. 决定放弃多用户同时推送，GAE的免费配额太蛋疼了
![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/D2O4j6gxCyasiep.jpg)
>20130124更新:

1. 继续优化results显示的结果 (采用Gemoo的提供方案https://github.com/GeMoo/Temp/blob/master/PasscodeAutoV1.2_items_time_display.py)
2. 显示提交时间
3. 新增邮件提示 可以进行及时的邮件通知。
4. 增强安全性，只有管理员权限才能执行手段抓取 /auto
5. 主页实现当前G+五分钟内passcode显示 （感谢[+D KWOKWO](https://plus.google.com/u/0/100677208124371524293/posts)友情UI设计）

然后就是喜闻乐见的下载地址[PasscodeAuto](http://code.google.com/p/kissshell/downloads/list?can=1)

最后的最后 感谢 shizhao 的 [passcode.py](https://gist.github.com/4528587) 以及 [小孩](https://ssl.xiaohai.co/)还有强大的GAE

>Update: 2022.01.28

G+ 已死

Ingress 早已进入 prime 时代

此项目仅作记录