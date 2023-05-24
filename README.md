# flvExtend.js

基于 flv.js / mpegts.js 的功能扩展插件

对 `flv.js` / `mpegts.js` 的一些常见问题，形成解决方案并进行封装

见文章：[flv.js 追帧、断流重连及实时更新的直播优化方案](https://www.cnblogs.com/xiahj/p/flvExtend.html)

## 特性

- 更流畅的追帧
- 断流重连
- 实时更新视频
- 解决 stuck 问题，视频卡住自动重建

## Demo

[https://shady-xia.github.io/flvExtend](https://shady-xia.github.io/flvExtend)

## 安装及使用

```bash
npm install flv-extend -S
```

```html
<!-- 注意！必须为video标签 -->
<video id="video" controls autoplay></video>
```

```js
import FlvExtend from 'flv-extend'

const videoElement = document.getElementById('video')

// 配置需要的功能
const flv = new FlvExtend({
  element: videoElement, // *必传
  frameTracking: true, // 开启追帧设置
  updateOnStart: true, // 点击播放后更新视频
  updateOnFocus: true, // 获得焦点后更新视频
  reconnect: true, // 开启断流重连
  reconnectInterval: 0 // 断流重连间隔
})

// 调用 init 方法初始化视频
// init 方法的参数与 flvjs.createPlayer 相同，并返回 flvjs.player 实例
const player = flv.init(
  {
    type: 'flv',
    url: 'http://192.168.0.11/stream',
    isLive: true
  },
  {
    enableStashBuffer: false, // 如果您需要实时（最小延迟）来进行实时流播放，则设置为false
    autoCleanupSourceBuffer: true, // 对SourceBuffer进行自动清理
    stashInitialSize: 128, // 减少首帧显示等待时长
    enableWorker: true // 启用分离的线程进行转换
  }
)

// 直接调用play即可播放
player.play()
```

## `flv.js` 与 `mpegts.js`

[flv.js 地址](https://github.com/bilibili/flv.js)

[mpegts.js 地址](https://github.com/xqq/mpegts.js)

**区别和提升**

这两个库都是作者xqq开发的，由于作者已经没有`flv.js`库的权限，该项目无法再维护，遂作者迁移到了 `mpegts.js`。

`mpegts.js` 相比 `flv.js`，有以下提升（摘于github issue）：

1. 更新了项目的构建工具；用 webpack 替换了 gulp 打包，并支持 typescript
2. 新增了对 MPEG2-TS 流的支持
3. 修复了部分空指针错误
4. 调整了stashSize以支持低延迟
5. 新增了如 liveBufferLatencyChasing, liveBufferLatencyMaxLatency, liveBufferLatencyMinRemain 的配置以支持直播追帧
6. 修复了 fetchStreamLoader 中断 fetch 请求问题
7. 更新了音画同步算法；采用了新的音频填充算法

**迁移升级**

由于原 `flv.js` 不再维护， 本项目从 `v0.2.0` 开始，升级到了 `mpegts.js`，`mpegts.js`继承了 `flv.js` 的所有功能，并添加了一些新的API，旧版本用户可以无感升级。

**关于追帧**

`mpegts.js` 自带了追帧的功能，所以与当前插件的追帧功能选择一种使用即可。

不过 `mpegts.js` 是使用跳帧的方式实现的，会出现视频跳帧闪现的现象，效果没有该插件流畅

## API

### FlvExtend

**constructor**

实例化 FlvExtend

```js
new FlvExtend(Options)
```

Options 选项如下：


| 字段                   | 类型          | 默认值   | 描述                                                                                                           |
|----------------------|-------------|-------|--------------------------------------------------------------------------------------------------------------|
| *element             | HTMLElement | 无     | \*必填，video 标签的 dom                                                                                           |
| frameTracking        | boolean     | false | 是否开启追帧设置                                                                                                     |
| updateOnStart        | boolean     | false | 点击播放按钮后实时更新视频                                                                                                |
| updateOnFocus        | boolean     | false | 回到前台后实时更新视频                                                                                                  |
| reconnect            | boolean     | false | 断流后重连                                                                                                        |
| reconnectInterval    | boolean     | 0     | 重连间隔(ms)                                                                                                     |
| trackingDelta        | number      | 2     | 能接受的最大延迟(s)，当视频缓冲区末尾时间与当前播放时间的差值（即实时延迟）大于该值时，会触发追帧。注意：如果该值设置过小，则会频繁触发视频loading。仅当设置 `frameTracking:true` 时有效 |
| trackingPlaybackRate | number      | 1.1   | 追帧时的播放速率，需大于1。仅当设置 `frameTracking:true` 时有效                                                                  |
| showLog              | boolean     | false | 是否显示插件的log信息（包括回到前台、跳帧、卡住重建、视频ERROR）                                                                         |


**init(mediaDataSource, config)**

初始化播放器，得到 player 对象

参数与 flv.js / mpegts.js 中的 `createPlayer(MediaDataSource, Config)` 相同

[查看MediaDataSource配置](https://github.com/xqq/mpegts.js/blob/master/docs/api.md#mediadatasource)

[查看Config配置](https://github.com/xqq/mpegts.js/blob/master/docs/api.md#config)

该方法主要做了以下事情：

- 调用 `createPlayer()` 创建播放器
- 调用 `attachMediaElement()` 绑定 video 标签
- 调用 `load()` 方法加载视频

该方法返回 `player`

```js
// e.g.
const player = flv.init(
  {
    type: 'flv',
    url: 'http://192.168.0.11/stream',
    isLive: true
  },
  {
    enableStashBuffer: false // 如果您需要实时（最小延迟）来进行实时流播放，则设置为false
  }
)
```

**update()**

更新视频时间到最新

**rebuild()**

重建播放器，会调用 `destroy()` 和 `init()`

**destroy()**

销毁播放器


### Player

通过调用 `init()` 方法产生的 flvjs.player 对象，该插件在原有基础上进行了扩展，增加了以下方法：

**update()**

更新视频时间到最新

**rebuild()**

重建播放器，会调用 `destroy()` 和 `init()`

**close()**

销毁播放器

**onerror(event)**

flvjs / mpegts 的 `ERROR` 事件

```js
// e.g.
player.onerror = (e) => {
  console.log('error', e)
}
```

**onstats(event)**

flvjs / mpegts 的 `STATISTICS_INFO` 事件

**onmedia(event)**

flvjs / mpegts 的 `MEDIA_INFO` 事件

**其他属性/方法**

flvjs.player 对象上的属性：

```typescript
interface Player {
    constructor(mediaDataSource: MediaDataSource, config?: Config): Player;
    destroy(): void;
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    attachMediaElement(mediaElement: HTMLMediaElement): void;
    detachMediaElement(): void;
    load(): void;
    unload(): void;
    play(): Promise<void>;
    pause(): void;
    type: string;
    buffered: TimeRanges;
    duration: number;
    volume: number;
    muted: boolean;
    currentTime: number;
    mediaInfo: Object;
    statisticsInfo: Object;
}
```

## License

[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
