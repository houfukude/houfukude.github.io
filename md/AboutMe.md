# 关于本博客

> update 2022-02-06 20:40:00

<!--media-->

<media src="https://ha.houfukude.tk:8123/local/KD_Searching.m4a" ></media>

终于重拾写独立博客的想法,在把以前的技术文档都转换之后,又折腾了不少玩意

本项目起源于最初想给 nginx 目录浏览功能(autoindex)进行一下美化.

> 从命名 和 `autoindex.js` 中还能看到大量遗留代码,尤其是 `mode=AI` 下的所有情况

> 暂时没考虑移除,毕竟 nginx 的 `autoindex` 还挺好用的

在 `nginx` 下的效果如图
![autoindex.jpg](https://s2.loli.net/2022/02/06/YcVWRIMk9lJfd6e.jpg 'autoindex on nginx')

然后就想着既然都美化了,顺便就把每个目录下的 `readme.md` 给展示出来吧.

那段时间书写整理了大量 markdown 的文档,而并不是每个人的浏览器都安装了 markdown 展示插件.

> 尤其是在用 `swagger` 自动化生成项目 API 之前,都是手撸的 API 文档

于是就考虑在浏览器端不安装插件就能*优雅*浏览的方案.

再到后来,搭在 Google Cloud 的独立博客范围内不了,~~最后才发现是要开付费账户才能使用数据库([BigQuery](https://cloud.google.com/bigquery))~~

就一咬牙一跺脚,就进行了浩浩荡荡的博客迁移.

> PS 本博客只是一个试验场,很多东西都还在随心变更中,估计某天哪根筋不对就是一个 break changes

## 项目说明

> 也算是 阶段性成果展示吧

-   **动态页面** ( 别人都是尽量进行页面静态化,就你这个搞事娃搞个伪动态 )

    所有的文章都在 `/md/` 目录下, 通过访问 `index.html?p=xxx` 进行读取对应的 `xxx.md` 然后动态填充到页面中, 这样的优点就是一个 `index.html` 就可以解析所有的 markdown 文件. ~~遥想最初的时候, 每个目录一份 html+css+js,每次有新文档就复制粘贴一份~~

    也因为历史遗留问题 `nginx autoindex` 所有很多东西都是通过 js 动态注入的

-   **扩展各类流程图支持**

    本项目支持三种表格 `flow` , `sequence`, `mermaid` 转换成 svg 图 展示

    ## flow 图

    ```flow
    start=>start: 开始
    input=>inputoutput: 输入
    operation=>operation: 操作
    condition=>condition: 操作出错？
    output=>inputoutput: 输出
    error=>operation: 请重新输入
    end=>end: 结束

    start->input
    input->operation
    operation->condition
    condition(no,bottom)->output
    condition(yes)->error(top)->input
    output->end
    ```

    ## sequence 图

    ```sequence
    title: MarkDown 画sequence图
    participant finefine as ff
    participant kunkun as kk
    ff-->kk: this is kunkun?
    kk-->ff: yes!
    ```

    ## mermaid 图

    > 这玩意尤其强大 参考地址 https://mermaid.live/edit

    ```mermaid
    erDiagram
            CUSTOMER }|..|{ DELIVERY-ADDRESS : has
            CUSTOMER ||--o{ ORDER : places
            CUSTOMER ||--o{ INVOICE : "liable for"
            DELIVERY-ADDRESS ||--o{ ORDER : receives
            INVOICE ||--|{ ORDER : covers
            ORDER ||--|{ ORDER-ITEM : includes
            PRODUCT-CATEGORY ||--|{ PRODUCT : contains
            PRODUCT ||--o{ ORDER-ITEM : "ordered in"
    ```

-   **整合音乐播放** ( beta )

    只需要在需要播放音乐的 markdown 文章中嵌入如下标签

    ```
    <media src="https://example.com/background.mp3" ></media>
    ```

    `autoindex.js` 会自动在右上角加载播放器 并尝试加载 https://example.com/cover.jpg 作为音频封面,此页面已有展示

-   **pre_commit.py** ( 不太聪明的自动化脚本.就算你是 alpha 版吧. )

    由于本 Blog 使用的基于 github issue 作为评论系统. 每次有新的文章就要对应开启一个新的 issue .

    手动去搞这很明显不符合程序员的身份,于是在参考了不少文章后,整合了一份适合本 Blog 的脚本

    流程如下:

    ```mermaid
    graph LR
        A[读取在线 issue] --> C{比对}
        B[读取本地 md 目录] --> C{比对}
        C -->|新记录|D[更新本地 index]
        C -->|新文章|E[创建在线 issue]
    ```

    > PS 目前使用的还是比较初级,有需要可以查看 `pre_commit.py`

    > https://blog.houfukude.tk/pre-commit.py

    不过现在写文章可以更加专注内容 (笑 , 创建一个 md ,然后在提交 github 之前 运行一下

    ```shell
    python3 pre_commit.py
    ```

    就不需要折腾其他的了

    执行效果

    ![pre_commit.jpg](https://s2.loli.net/2022/02/06/UkDsFjSVqGu2i1L.jpg)

## TODO LIST

目前能想到继续更新方向

~~或许会做或许不会做~~

-   **返回首页** ( 这个应该一定会弄 )

-   **toolbar 功能** ( 当前 toobar 还是太单薄了 )

-   **友情链接** ( 独立博客怎么少得了友链呢,虽然现在身边已经没人折腾了 )

-   **sitemap** ( 就一个 index 不知道有没有必要做一个站点地图 )

-   **基于 github actions 的一些自动化功能** ( 或许会整合 `pre_commit.py` )

## 架构工具

-   前端框架 [MDUI](https://www.mdui.org/)

-   音乐播放 [aplayer](https://aplayer.js.org/)

-   本地调试 [webd](https://gwgw.ga/fidx.html#/webd/)

-   内容书写 [markdown](https://markdown.com.cn/basic-syntax/)

-   代码格式化 [Prettiter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

-   评论管理 [Gitalk](https://github.com/gitalk/gitalk)

-   访问统计 [不蒜子](http://busuanzi.ibruce.info/)

-   旧文章迁移 [BBCode-To-Markdown](https://jondum.github.io/BBCode-To-Markdown-Converter/)

-   图片托管 https://sm.ms/

## 参考文献

-   [Make an issue on github using API V3 and Python](https://gist.github.com/JeffPaine/3145490)

-   [WordPressXMLRPCTools](https://github.com/zhaoolee/WordPressXMLRPCTools)
