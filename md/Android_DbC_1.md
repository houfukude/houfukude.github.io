# Android 契约编程 (一) IntDef 和 StringDef

> Update: 2017-01-23 15:25:30

以前在做 android 开发的时候 一直很好奇 `View.setVisibility(View.VISIBLE)` 是怎么做到只识别 `VISIBLE, INVISIBLE, GONE`这三个参数的。

它到底是怎么实现的呢 =。= 现在我们来走进科学~

无聊的时候翻看源码才发现使用了

> **IntDef/StringDef: 类型定义注解**

> 整型除了可以作为资源的引用之外，也可以用作“枚举”类型使用。

> @IntDef 和”typedef”作用非常类似，你可以创建另外一个注解，然后用@IntDef 指定一个你期望的整型常量值列表，最后你就可以用这个定义好的注解修饰你的 API 了。

> via [Android 注解支持](http://www.flysnow.org/2015/08/13/android-tech-docs-support-annotations.html)

于是自己动手也写一点代码测试

```JAVA
public class IntDefTest {
    public static final int VALUE_0 = 0;
    public static final int VALUE_1 = 1;
    public static final int VALUE_3 = 3;

    @IntDef({VALUE_0, VALUE_1})
    public @interface Values {
    }

    private int value;

    public int getValue() {
        return value;
    }

    public void setValue(@Values int value) {
        this.value = value;
    }

    public void runTest() {

        new IntDefTest().setValue(VALUE_0);
        new IntDefTest().setValue(VALUE_1);
        new IntDefTest().setValue(VALUE_3);
    }

}
```

在 Android Studio 上效果如图:

![houfukudeimg.appspot.jpg](https://s2.loli.net/2022/01/28/XIN5oY3MtsmTuqH.jpg)

这样就可以很直观的发现在设置引用变量是否出错。

这在契约编程中就可以约束前置条件了。

由于我太懒了 我就再引用一段别人博客里的代码吧 2333

> 你也可以指定一个整型是一个标记性质的类型；这样客户端代码就通过|，&等操作符同时传递多个常量了：

```JAVA
@IntDef(flag=true, value={
        DISPLAY_USE_LOGO,
        DISPLAY_SHOW_HOME,
        DISPLAY_HOME_AS_UP,
        DISPLAY_SHOW_TITLE,
        DISPLAY_SHOW_CUSTOM
})
@Retention(RetentionPolicy.SOURCE)
public @interface DisplayOptions {}
```

> 最后，还有一个字符串版本的注解，就是@StringDef，它和@IntDef 的作用基本上是一样，所不同的是它是针对字符串的。该注解一般不常用，但是有的时候非常有用，比如在限定向 Activity#getSystemService 方法传递的参数范围的时候。

via [Android 注解支持](http://www.flysnow.org/2015/08/13/android-tech-docs-support-annotations.html)
