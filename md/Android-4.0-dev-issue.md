# Android 4.0 以上开发注意事项

>Update: 2013-01-30 00:21:51

在android 4.0上运行时报<font color=red>android.os.NetworkOnMainThreadException</font>异常

问题描述：

        访问网络不能在主程序中进行

# 解决：

## 方法1：在主线程增加如下代码

```
// 详见StrictMode文档
StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()
        .detectDiskReads()
        .detectDiskWrites()
        .detectNetwork()   // or .detectAll() for all detectable problems
        .penaltyLog()
        .build());
StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()
        .detectLeakedSqlLiteObjects()
        .detectLeakedClosableObjects()
        .penaltyLog()
        .penaltyDeath()
        .build());
```
    
## 方法2：启动线程执行网络任务

```
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        // 启动线程执行联网任务
        new Thread(NetworkRun).start();
}

/**
        * 联网线程
        */
Runnable NetworkRun = new Runnable(){

        @Override
        public void run() {
                // TODO Auto-generated method stub
                updateListView();
        }
};
```

>Update: 2022.01.28

又是一篇已经过时的文章
