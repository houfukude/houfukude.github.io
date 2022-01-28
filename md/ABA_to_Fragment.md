# ActionBarActivity在进行替换Fragment时的问题

>Update: 2015-03-13 15:47:32

最近一直在使用ActionBarActivity来进行activity开发

ActionBarActivity继承自FragmentActivity，

可以同时支持

```java
android.app.Fragment
```

和 

```java
android.support.v4.app.Fragment
```

但是在对Fragment的展示有不同。

如果直接使用FragmentActivity在添加Fragment的时候可以直接使用

```java
FragmentTransaction.replace(android.R.id.content, Fragment);
```

但是在`ActionBarActivity`的时候就遇到了问题 特别是在添加

`android.app.Fragment` 的时候，会出现 `Fragment` 不显示或者不正常显示

于是就有如下代码片段：

```java
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.ActionBarActivity;
/**
    * BaseActivity is a custom parent Activity class
    * which can replace Fragment with replaceFragment()
    * Created by Houfukude on 03-13.
    */
public abstract class BaseActivity extends ActionBarActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.only_framelayout);
    }

    protected void replaceFragment(android.app.Fragment fragment) {
        android.app.FragmentTransaction fragmentTransaction = getFragmentManager().beginTransaction();
        fragmentTransaction.replace(getFragmentID(), fragment);
        fragmentTransaction.commitAllowingStateLoss();
    }

    protected void replaceFragment(Fragment fragment) {
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(getFragmentID(), fragment);
        fragmentTransaction.commitAllowingStateLoss();
    }

    protected int getFragmentID() {
        //
        //return android.R.id.content;
        //this R.id.frameLayout is comes from R.layout.only_framelayout
        //or override this function to  return other view ID
        return R.id.frameLayout;
    }
}
```
    
`only_framelayout.xml`文件就只有一个FrameLayout 就不贴代码了

把这个作为父类就可以快速展示任意Fragment了无论是

```
android.app.Fragment
```

还是

```
android.support.v4.app.Fragment
```

同时还可以通过重写getFragmentID()方法来达到替换任意view的目的 

自我感觉还不错吧 =。=

-----------------我是蛋疼的分割线-----------------

好吧 好久没更新博客了 一直都在剁手

更新一发！证明自己还活着

>Update: 2022.01.28

看看以前自己稚嫩的代码 哈哈哈哈哈哈