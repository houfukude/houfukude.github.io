# 筷子平台接口文档

version 0.1(超级先行预览版)

* 本文档基于 MarkDown 语法编写，方便版本更迭.

* 本文档中的 `<TIME>` 如无特殊说明格式均为 "`yyyy-MM-dd HH:mm:ss`"

* 本文档中的 `<FILE>` 如无特殊说明均为HTTP表单请求发送文件

* 本文档描述的接口如无特殊说明，均使用 `<TOKEN>` 进行授权判断。

* 密码在传输前使用 `MD5` 进行加密，`MD5` 加密使用32位小写字母。

* 本文档中的 `返回信息` 中 `code` 0：正常，其他值表示错误

* JSON数据最外层结构

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    // 各个接口 data 段对应的数据结构
    data: {[DATA]}
}
```

* 本文档所有的带`LIST`后缀的列表均采用 `offset` 和 `limit` 进行分页和分页大小处理，默认省缺值为 `offset=0` 和 `limit=20`

* 本文档所有接口,如无特殊说明,统一`UTF-8`的编码方式传输数据

* 名词解释

| 角色定义（role）    | 描述                       |
| --------          | -------------------------- |
| buyer             | 进行下单操作的用户
| seller            | 发布商品的用户
| attendant         | 进行提供各类服务的用户
| staff_auditor     | 后台审核人员
| staff_finance     | 后台财务人员

<font color=orange>**⚠️ 注意**</font>
手机号为平台唯一标示，同一个账户（手机号）可以同时拥有多个角色

| 订单定义           | 描述                       |
| --------          | -------------------------- |
| order             | 商品订单，商家发布的商品，由买家进行下单所产生的订单
| ticket            | 服务工单，商品订单行进到一定阶段，由系统对应生成的工单
| wechat            | 微信订单，商品、会员在微信支付时产生的支付单

# 0. 通用模块

## 0.1. 文件上传

    统一的单文件上传接口，通过表单提交（非 json），获取完整的文件地址 （包括图片）

TYPE `POST` 

> `/Base/Upload`

REQUEST 

    file

RESPONSE 

``` JSON
{
    code: 0,
    message: "success",
    data:     
    {
        name:"1.jpg",
        url: "https://example.com/xxxx/1.jpg"
    }
}
```


## 0.2. 微信注册

    通过当前URL 获取微信的注册授权 通过openID  用于微信内 扫码 支付 和 登录等操作

<font color=green>**ℹ️帮助**</font> 
[如何获取OpenId](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)

TYPE `GET` 

> `/Base/Wxjssdk`

REQUEST 

``` JSON
{
    // 当前页面URL
    URL: "https://example.com/buyer/home",
}
```

RESPONSE 

``` JSON
{
    code: 0,
    message: "success",
    data:     
    {   
        // 公众号的唯一标识
        appId:"app001",
        // 生成签名的时间戳
        timestamp: "",
        // 生成签名的随机串
        nonceStr: "",
        // 签名
        signature: ""
    }
}
```

## 0.3. 商品信息（微信内 支付用）

    通过内部订单号获取签名后的商品信息用于微信发起支付 包括 订单商品 和 会员商品

TYPE `POST` 

> `/Base/wechatOrder`

REQUEST 

``` JSON
{
    // 商品编号
    SN: "https://example.com/buyer/home",
    // 附加信息（可能是数据对象）
    attach: ""
}
```

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    // 微信 getBrandWCPayRequest 需要的字段 
    data: {[WECHAT_PAY]}
}
```

<font color=green>**ℹ️帮助**</font>
`WECHAT_PAY` 字段可以参考 [微信内H5调起支付](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_7&index=6)


## 0.4 发送登录码

    通过手机号申请一次短信验证 用于 登录注册

TYPE `POST` 

> `/User/LoginCode`

REQUEST 

``` JSON
{
    // 登录角色
    role: "buyer",
    // 用户手机号 
    phone: "15999999999",
}
```

RESPONSE 

``` JSON
{
    code: 0,
    message: "success",
    data: “”
}
```

## 0.4 发送验证码

    通过用户ID申请一次短信验证 用于 提现修改密码等敏感操作 

TYPE `POST` 

> `/User/VerifyCode`

REQUEST 

``` JSON
{
    // 登录角色
    role: "buyer",
    // 用户手机号 
    phone: "15999999999",
    // 短信类型 （见如下表格） 
    action: 100
}
```

| 短信编号  | 短信类型           | 描述                       |
| -------- | --------          | -------------------------- |
| 100      | password          | 修改密码
| 200      | withdraw          | 提现
| 300      | bindcard          | 绑定银行卡

<font color=red>**⚠️ 待完善**</font> 

RESPONSE 

``` JSON
{
    code: 0,
    message: "success",
    data: “”
}
```

# 1. 用户模块

## 1.1. 注册登录

    通过账号+短信验证码 老用户登录 新用户注册 并获取用户授权

TYPE `POST` 

> `/User/Login`

REQUEST 

``` JSON
{
    // 登录角色
    role: "buyer",
    // 用户手机号 
    phone: "15999999999",
    // 短信验证码
    smsCode: "398483"  
    // 邀请信息
    invate: "159xxxx"
}
```

RESPONSE 

``` JSON
{
    code: 0,
    message: "success",
    data: 
    {
        token: ""
    },
}
```

## 1.1. 微信登录

    获取微信用户绑定的手机号并登录

<font color=green>**ℹ️帮助**</font>
微信内 [手机号获取](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)



## 1.2. 用户信息

    用户获取自己的个人信息

TYPE `GET` 

> `/User/Info`

REQUEST

    无

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data: 
    {
        // 用户ID
        id: "kzuser001",
        // 用户头像
        avatar: "",
        // 用户昵称
        nickname: "真的侯爷",
        // 用户积分
        score: "12384"
        // 用户的会员等级 0=非会员 666=初级会员 999=高级会员
        level: 0
        // 。。。
    }
}
```

## 1.3. 信息编辑

    对用户信息进行指定字段更新

TYPE `PATCH` 

> `/User/Info`

REQUEST

``` JSON
{
    // 更新字段  详情见下图
    attr: "nickname",
    // 用户手机号 手机号为平台唯一标示
    data: "真的侯爷",
}
```

| 更新字段 （ attr ） | 描述                       |
| --------          | -------------------------- |
| nickname          | 用户昵称
| avatar            | 用户头像

<font color=red>**⚠️ 待完善**</font>

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data: ""
}
```

## 1.4. 用户佣金

    用户获取所有角色拥有的佣金（收入）

TYPE `GET`

> `/User/Income`

REQUEST

    无

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data: 
    {
        // 总可提现佣金
        withdrawable: "2520.56",
        // 用户作为买家分得的累计佣金
        buyerTotal: "520.00",
        // 用户作为卖家分得的累计佣金
        sellerTotal: "2000.56",
        // 用户作为服务商分得的累计佣金
        attendantTotal: "0.00"
    }
}
```

## 1.5. 佣金记录

    用户通过不同角色查询对应的佣金记录

TYPE `GET`

> `/User/IncomeList`

REQUEST

``` JSON
{
    // 查询角色
    role: "buyer",
    // 分页参数
}
```

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    // 列表数据
    data: 
    [
        {
            // 记录编号
            id:"",
            // 记录标题
            title: "",
            // 记录描述
            desc: "",
            // 记录时间
            time: "<TIME>"
        }
    ]
}
```

## 1.6. 发起提现

    用户发起一次佣金提现（不分角色）

TYPE `POST`

> `/User/Withdraw`

REQUEST

``` JSON
{
    // 发起金额
    amount: "300"
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: ""
}
```
## 1.7. 查询银行卡

    用户查询当前名下绑定的银行卡信息（不分角色）

TYPE `GET`

> `/User/bankCard`

REQUEST

    无

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    {
        // 真实姓名
        realname: "",
        // 银行卡号
        card: "300"
        // 开户行
        bank: ""
        // 支行信息
        branch: ""
    }
}
```

## 1.7. 绑定银行卡

    用户更新名下的银行卡信息（有且仅有一张）（不分角色）

TYPE `POST`

> `/User/bankCard`

REQUEST

``` JSON
{
    // 真实姓名
    realname: "",
    // 银行卡号
    card: "300"
    // 开户行
    bank: ""
    // 支行信息
    branch: ""
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: ""
}
```

## 1.8. 提现记录

    查询提现中 提现成功 提现失败的记录（不分角色）

TYPE `GET`

> `/User/withdrawList`

REQUEST

``` JSON
{
    // 提现状态 
    status: "0",
    // 分页参数
}
```

| 提现状态 （status） | 描述                       |
| --------          | -------------------------- |
| 0                 | 全部记录
| 1                 | 提现中
| 2                 | 提现成功
| 3                 | 提现失败

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 记录的id
            id: 001
            // 提现数额
            amout: 200
            // 状态
            status: 0
            // 发起时间
            creatTime: "<TIME>"
            // 完结时间 (成功 or 失败)
            finshTime: "<TIME>"
        }
    ]
}
```

## 1.9. 邀请记录

    获取当前用户作为买家邀请的好友列表 


TYPE `GET`

> `/User/invateList`

REQUEST

``` JSON
{
    // 关键字 （关键字搜索？没时间先不做）
    keywords: "",
    // 分页参数
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 记录的id
            id: 001,
            // 用户头像
            avatar: "",
            // 用户昵称
            nickname: "",
            // 用户等级
            level: 0,
            // 邀请时间
            time: "<TIME>",
        }
    ]
}
```


# 2. 商品模块

## 2.1. 首页商品

    首页推荐商品列表

TYPE `GET`

> `/Goods/Index`

REQUEST

    无

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 商品的id
            id: 001,
            // 商品名称
            name: "",
            // 商品描述
            desc: "",
            // 商品库存
            stock: 500,
            // 商品意向金
            price:"",
            // 商品展示图片
            imageList: "",
            // 商品分类
            category: "",
            // 发布时间
            time: "<TIME>",
        }
    ]
}
```

## 2.2. 商品分类

    一次性拉取全部的商品分类

TYPE `GET`

> `/Goods/Category`

REQUEST

    无

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {   
            // 分类 id
            id:"",
            // 分类名称
            name:""
        }
    ]
}
```



## 2.3. 商品搜索

    通过分类 + 关键字 获取商品列表

TYPE `GET`

> `/Goods/Search`

REQUEST

``` JSON
{
    // 关键字 （关键字搜索？没时间先不做）
    keywords: "",
    // 分类参数
    category: ""
    // 分页参数
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 商品的id
            id: 001,
            // 商品名称
            name: "",
            // 商品描述
            desc: "",
            // 商品库存
            stock: 500,
            // 商品意向金
            price:"",
            // 商品展示图片
            imageList: "",
            // 商品分类
            category: "",
            // 发布时间
            time: "<TIME>",
        }
    ]
}
```

## 2.4. 收藏列表

    用户（买家）收藏的商品列表


TYPE `GET`

> `/Goods/FavoriteList`

REQUEST

    无

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 商品的id
            id: 001,
            // 商品名称
            name: "",
            // 商品描述
            desc: "",
            // 商品库存
            stock: 500,
            // 商品意向金
            price:"",
            // 商品展示图片
            imageList: "",
            // 商品分类
            category: "",
            // 发布时间
            time: "<TIME>",
        }
    ]
}
```

## 2.5. 更新收藏

    添加 + 删除 收藏商品

TYPE `POST`

> `/Goods/Favorite`

REQUEST

``` JSON
{
    // 商品id
    id: "",
    // 操作类型 
    action: "add"
}
```

| 操作类型 ( action )| 描述                       |
| ----------------- | -------------------------- |
| add               | 添加收藏
| del               | 删除收藏

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: ""
}
```

## 2.6. 商品详情

    通过商品的id 获取商品的详情

TYPE `GET`

> `/Goods/Detail`

REQUEST


``` JSON
{
    // 商品id
    id: "",
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    {
        // 商品的id
        id: 001,
        // 商品名称
        name: "",
        // 商品描述
        desc: "",
        // 商品库存
        stock: 500,
        // 商品意向金
        price:"",
        // 商品展示图片
        imageList: "",
        // 商品分类
        category: "",
        // 发布时间
        time: "<TIME>",
    }
}
```

## 2.7. 上传商品

    卖家上传新的商品

TYPE `POST`

> `/Goods/Create`

REQUEST

``` JSON
{
    // 商品名称
    name: "",
    // 商品描述
    desc: "",
    // 商品库存
    stock: 500,
    // 商品意向金
    price:"",
    // 商品展示图片
    imageList: "",
    // 商品分类
    category: "",
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: ""
}
```

## 2.8. 上下货架

    对现有已审核通过的商品进行上下架操作

TYPE `POST`

> `/Goods/Shelf`

REQUEST

``` JSON
{
    // 商品id
    id: "",
    // 操作类型 
    action: "on_sele"
}
```

| 操作类型 ( action )| 描述                       |
| ----------------- | -------------------------- |
| on_sele           | 上架
| take_off          | 下架

<font color=orange>**⚠️ 注意**</font>
当商品的库存为 0（`stock = 0`）的时候 商品会自动进行下架处理，并无法再次上架

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: ""
}
```

## 2.9. 发布列表

    当前用户名下发布的商品列表展示

TYPE `GET`

> `/Goods/SellList`

REQUEST

``` JSON
{
    // 状态参数
    status: "",
    // 分类参数
    category: ""
    // 分页参数
}
```

RESPONSE

```json
{
    // 错误码
    code: 0,
    // 错误信息
    message: "success",
    data: 
    [
        {
            // 商品的id
            id: 001,
            // 商品名称
            name: "",
            // 商品描述
            desc: "",
            // 商品库存
            stock: 500,
            // 商品意向金
            price:"",
            // 商品展示图片
            image: "",
            // 商品分类
            category: "",
            // 商品状态 (已上架 未上架)
            status: ""
            // 发布时间
            time: "<TIME>",
        }
    ]
}
```

# 3. 订单模块

<font color=green>**ℹ️帮助**</font>
订单状态流转图

``` flow
user=>start: 买家:填写信息下单

s001=>parallel: 待付款[状态1]
s002=>parallel: 进行中[状态2]
s005=>parallel: 退款中[状态5]

buyercancel=>inputoutput: 买家:取消
pay=>inputoutput: 买家:支付
sellercancel=>inputoutput: 卖家:取消
refund=>inputoutput: 财务:退款
ticket=>inputoutput: 服务商:完成工单

s003=>end: 已取消[状态3]
s004=>end: 已完成[状态4]
s006=>end: 已退款[状态6]

user->s001
s001(path1,bottom)->pay->s002
s001(path2,right)->buyercancel->s003
s002(path1,bottom)->ticket->s004


```
<!--
// 隐藏的部分流程

s002(path2,right)->sellercancel
sellercancel->s005
s005(path1,bottom)->refund->s006

-->
<font color=orange>**⚠️ 注意**</font>
任何状态下后台都可以强制终止流程，订单状态：`异常终止[状态7]` 


| 订单状态 （status） | 描述                       |
| --------          | -------------------------- |
| 1                 | 待付款
| 2                 | 进行中
| 3                 | 已取消
| 4                 | 已完成
| 7                 | 异常终止

## 3.1. 买家下单

    买家通过商品详情页面进行下单操作

TYPE `POST` 

> `/Order/Create`

REQUEST

``` JSON
{
    // 商品id
    id: "",
    // 买家的联系方式
    phone: "159999",
    // 买家姓名
    name: "",
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:     
    {   
        // 生成的订单编号，一般用于意向金支付
        orderId:"order00021314",
    }
}
```

## 3.2. 更新订单

    买家或者买家 在订单生命周期的不同阶段对应的订单状态变更

<font color=orange>**⚠️ 注意**</font>
这个接口目前使用的范围：

    status 1->3 未付款的订单被买家主动取消

TYPE `POST` 

> `/Order/Status`

REQUEST

``` JSON
{
    // 订单Id
    orderId: "",
    // 订单变更的状态
    status: "3",
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:""
}
```

## 3.3. 订单列表

    通过传入角色（ buyer seller） 获取买家订单和卖家订单 带关键字搜索

TYPE `GET` 

> `/Order/List`

REQUEST

``` JSON
{
    // 查询订单的角色
    role: "buyer",
    // 订单状态
    status: "",
    // 分页参数
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:
    [
        {
            // 订单id
            orderId:"",
            // 订单创建时间
            time:"<TIME>",
            // 订单状态
            status:"",
            // 商品信息
            goods:
            {   
                //商品ID
                id:""
                //商品的其他信息
            },
            // 卖家信息
            seller:
            {
                
            },
            // 买家信息
            buyer:
            {
                
            },
        }
    ]
}
```


## 3.4. 订单详情

    通过传入角色（ buyer seller） + 订单ID（orderId） 获取订单的详情

TYPE `GET` 

> `/Order/Detail`

REQUEST

``` JSON
{
    // 查询订单的角色
    role: "buyer",
    // 订单id
    orderid: "",
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:
    {
        // 订单id
        orderId:"",
        // 订单创建时间
        time:"<TIME>",
        // 订单状态
        status:"",
        // 商品信息
        goods:
        {   
            //商品ID
            id:""
            //商品的其他信息
        },
        // 卖家信息
        seller:
        {
            
        },
        // 买家信息
        buyer:
        {

        },
        // 订单对应的工单信息
        ticket:
        {

        },
    }
}
```

## 3.x. 评价订单

    买家对已完成对订单进行评价

<font color=red>**⚠️ 第一阶段不需要实现**</font> 

TYPE `POST` 

> `/Order/Comment`

# 4. 工单模块

## 4.1. 工单列表

    通过传入角色（seller attendant） 获取卖家工单和服务商工单 带关键字搜索

TYPE `GET` 

> `/Ticket/List`

REQUEST

``` JSON
{
    // 查询工单的角色
    role: "seller",
    // 工单状态
    status: "",
    // 分页参数
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:
    [
        {
            // 工单id
            ticketId:"",
            // 工单创建时间
            time:"<TIME>",
            // 工单状态
            status:"",
            // 工单所属流程Id
            belong:"",
            // 工单当前的步骤
            step: 
            {
                // 当前步骤id
                id: "",
                // 当前步骤 服务商信息
                // 当前步骤描述
            },
            // 对应的订单信息
            order:
            {   
                //订单Id
                id:""
                //商品的其他信息
            },
        }
    ]
}
```

## 4.2. 工单详情

    通过订单ID（ticketId） 获取订单的详情

TYPE `GET` 

> `/Ticket/Detail`

REQUEST

``` JSON
{
    // 查询工单的角色
    role: "seller",
    // 工单id
    orderid: "",
}

``` 

RESPONSE

``` JSON
{
    code: 0,
    message: "success",
    data:
    {
        // 工单id
        ticketId:"",
        // 工单创建时间
        time:"<TIME>",
        // 工单状态
        status:"",
        // 工单所属流程Id
        belong:"",
        // 工单的所有步骤记录
        steps: 
       [
            {
                // 当前步骤id
                id: "",
                // 当前步骤 服务商信息
                attendant: "SFKD",
                attendantName: "顺丰快递",
                // 当前步骤描述
                desc: "顺丰快递 小A 揽件",
                // 操作时间
                startTime: "<TIME>"
                //  完成时间
                endTime: "<TIME>"

            }
        ],
        // 对应的订单信息
        order:
        {   
            //订单Id
            id:""
            //商品的其他信息
        },
    }
}
```

## 4.3. 服务商列表

    当前账户可用的服务商

TYPE `GET` 

> `/Ticket/attendantList`



## 4.4. 服务商操作

    为当前用户（卖家 服务商）操作（添加 删除）服务商

TYPE `POST` 

> `/Ticket/attendant`



## 4.x. 指派工单

    对现有工单进行下一步指派


# 5. 后台模块

## 5.1. 商品列表

## 5.2. 审核商品

## 5.3. 用户列表

## 5.4. 用户操作

## 5.5. 财务工单列表

## 5.6. 财务工单操作

## 审核操作日志列表

## 财务操作日志列表

## 用户资金记录

## 提现记录

    后台查看所有发起的提现记录

## 确认提现

    财务审核 并填写打款流水单号