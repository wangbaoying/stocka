# 包装jQuery的ajax和deferred

使用了react等新的web库后,
jQuery最强悍的selector功能的则没有什么作用了,
然而到目前为止
jQuery的ajax和deferred依然
是最好的ajax库和最好用的promise库。

未来一段时间(没有更好的替代方案时),依然还会使用这两个库。

Fetch & Promise由于一些问题, 暂时不适合使用
  1, 浏览器兼容, jQuery更好;
  2, 处理进度功能
     XmlHttpRequest可以绑定progress事件,Fetch 这方面功能并不明朗
     deferred的notify/progress功能,可以用于进度通知,Promise 没有这个功能
     deferred接口比Promise接口更加友好

## ajax和deferred常用功能

  ajax: 
    1, 上传/下载, 进度
    2, CORS访问
  
  deferred:
    1, 任务的遍历
    2, 重任务失败试


## jQuery版本

   由于只使用ajax和deferred功能,可以考虑使用更低版本的jQuery,以获得更好的兼容性.

```json
"devDependencies": {
    "jquery": "=2.2.4"
}
```

