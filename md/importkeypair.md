# Android Studio 使用 系统签名文件

> update 2022-03-08 22:48:51

## 1. 首先下载 `keytool-importkeypair`

> keytool-importkeypair – A shell script to import key/certificate pairs into an existing Java keystore

[下载地址](https://github.com/getfatday/keytool-importkeypair)

## 2. 在 linux 环境中转换

```shell
#!/bin/sh

# 转换平台签名命令
./keytool-importkeypair -k ./platform.keystore -p android -pk8 platform.pk8 -cert platform.x509.pem -alias platform

# platform.keystore : 输出的签名文件
# android : 签名文件密码
# platform.pk8、platform.x509.pem : 系统签名文件
# platform : 签名文件别名
```

## 3. 在 build.gradle 中添加

```
release {
	storeFile file('../rk3288/platform.keystore')
	storePassword 'android'
	keyAlias 'platform'
	keyPassword 'android'
}
```

## 4. 使用

通过上面的操作，就可以像是普通的 `keystore` 的方法使用系统签名文件了,也可以安心使用共享系统进程了！

```
android:sharedUserId="android.uid.system"
android:sharedUserId="android.uid.shared"
android:sharedUserId="android.media"
```

## 5. 其他方式

```
java -jar signapk.jar platform.x509.pem platform.pk8 old.apk new.apk
```

## 6. 参考文献

[让 Android Studio 支持系统签名(证书)](https://www.jianshu.com/p/47265c8899b5)
