# Android 7.0 SoundPool踩坑记录

>Update: 2016-12-28 13:51:50

问题如下：

1. SoundPool 在 SDK > 21 上有新的初始化方式
1. 新的初始化方式中参数 `FLAG_HW_AV_SYNC` 在 SDK > 24(7.0 & 7.1.1) 就会出现无法播放
1. `SoundPool.load()` 在执行后不能立即播放 需要等待加载完毕后才能播放


解决方案：

1. 通过 `Build.VERSION.SDK_INT` 判断 进行不同方式的初始化
1. 取消参数 `FLAG_HW_AV_SYNC` 设置
1. 通过 `setOnLoadCompleteListener` 在加载完成后自动播放


解决代码如下：
    
```JAVA
private SoundPool musicSoundPool;

    private void prepareSound(@RawRes int res) {
        musicSoundPool.load(this, res, 1);
    }

    protected void createSoundPool() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            createNewSoundPool();
        } else {
            createOldSoundPool();
        }
        musicSoundPool.setOnLoadCompleteListener((soundPool, sampleId, status) -> {
            if (status == 0) {
                int volume = getVolume();
                soundPool.play(sampleId, volume, volume, 0, 0, 1);
            }
        });
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    protected void createNewSoundPool() {
        AudioAttributes attributes = new AudioAttributes.Builder()
                //.setFlags(AudioAttributes.FLAG_HW_AV_SYNC)
                //在 21<SDK<24 是没有任何问题的 但是在SDK>24(7.0 & 7.1.1) 就会出现无法播放
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build();
        musicSoundPool = new SoundPool.Builder()
                .setMaxStreams(10)
                .setAudioAttributes(attributes)
                .build();
    }
```

