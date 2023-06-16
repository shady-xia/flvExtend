# flvExtend.js

基于 flv.js / mpegts.js 的功能扩展插件

对 `flv.js` / `mpegts.js` 的一些常见问题，形成解决方案并进行封装

见文章：[flv.js 追帧、断流重连及实时更新的直播优化方案](https://www.cnblogs.com/xiahj/p/flvExtend.html)


## 特性

- 更流畅的追帧
- 断流重连
- 实时更新视频
- ~~解决 stuck 问题，视频卡住自动重建~~
- 方法和事件封装，更易使用

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

实例化 FlvExtend

```js
const flv = new FlvExtend(Options)
```

Options 选项如下：


| 字段                   | 类型          | 默认值  | 描述                                                                                                           |
|----------------------|-------------|------|--------------------------------------------------------------------------------------------------------------|
| *element             | HTMLElement | 无    | \*必填，video 标签的 dom                                                                                           |
| frameTracking        | boolean     | false | 是否开启追帧设置                                                                                                     |
| updateOnStart        | boolean     | false | 点击播放按钮后实时更新视频                                                                                                |
| updateOnFocus        | boolean     | false | 回到前台后实时更新视频                                                                                                  |
| reconnect            | boolean     | true | 断流后重连                                                                                                        |
| reconnectInterval    | boolean     | 1000 | 重连间隔(ms)                                                                                                     |
| maxReconnectAttempts | number/null | null  | 重连尝试次数，为null则不限制                                                                                                |
| trackingDelta        | number      | 2    | 能接受的最大延迟(s)，当视频缓冲区末尾时间与当前播放时间的差值（即实时延迟）大于该值时，会触发追帧。注意：如果该值设置过小，则会频繁触发视频loading。仅当设置 `frameTracking:true` 时有效 |
| trackingPlaybackRate | number      | 1.1  | 追帧时的播放速率，需大于1。仅当设置 `frameTracking:true` 时有效                                                                  |
| showLog              | boolean     | false | 是否显示插件的log信息（包括回到前台、跳帧、卡住重建、视频ERROR）                                                                         |

### Flv对象

flv为FlvExtend实例化后的对象

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
    // 此处为MediaDataSource配置
  {
    type: 'flv',
    url: 'http://192.168.0.11/stream',
    isLive: true
  },
    // 此处为Config配置  
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

**onError(errorObj, player)**

回调函数，播放期间由于任何原因发生错误时触发

```js
flv.onError = (errObj, player) => {
    console.log('播放失败...', errorObj)
}
```

一个 `errObj` 对象的例子：
```
{
    type: "NetworkError",
    detail: "Exception",
    info: {code: -1, msg: 'Failed to fetch'}
}
```

**onReconnect(reconnectObj, player)**

回调函数，由断流重连触发

```js
flv.onReconnect = (reconnectObj, player) => {
    console.log('重连中...')
}
```

`reconnectObj` 在 `errObj` 基础上，额外增加了 `reconnectAttempts` 参数

**onReconnectFailed(errObj, player)**

回调函数，重连次数用尽后触发，代表重连失败

```js
flv.onReconnect = (errObj, player) => {
    console.log('重连失败...')
}
```

**onProgress(event, player)**

回调函数，video原生的 `onprogress` 事件

**onStuck(player)**

目前连续3s帧无变化则为视频卡住，卡住后不再自动重建，而是提供一个 onStuck 回调，使用者自行处理

**其他回调函数**

原mpegts中的各个 [`mpegts.Events` ](https://github.com/xqq/mpegts.js/blob/master/docs/api.md#mpegtsevents)回调，名称为 `on+大驼峰`

参数均为 `event` 和 `player`

| 回调函数                                                   | 对应的Event                   | Description                                      |
|--------------------------------------------------------|----------------------------|--------------------------------------------------|
| onError(errObj, player)                                   | ERROR                      | 播放期间由于任何原因发生错误                                   |
| onLoadingComplete(player)                              | LOADING_COMPLETE           | 输入MediaDataSource已完全缓冲到结束                        |
| onRecoveredEarlyEof(player)                            | RECOVERED_EARLY_EOF        | 缓冲期间发生意外的网络EOF，但已自动恢复                            |
| onMediaInfo(mediaInfo, player)                         | MEDIA_INFO                 | 提供媒体的技术信息，例如视频/音频编解码器，比特率等                       |
| onMetadataArrived(metadata, player)                    | METADATA_ARRIVED           | 用"onMetaData"标记提供FLV文件（流）可以包含的元数据                 |
| onScriptdataArrived(data, player)                      | SCRIPTDATA_ARRIVED         | 提供FLV文件（流）可以包含的脚本数据（OnCuePoint / OnTextData）     |
| onTimedId3MetadataArrived(timed_id3_metadata, player)  | TIMED_ID3_METADATA_ARRIVED | 提供包含私有数据的定时ID3元数据包（stream_type=0x15）回调           |
| onSmpte2038MetadataArrived(smpte2038_metadata, player) | SMPTE2038_METADATA_ARRIVED | 提供包含私有数据的SMPTE2038元数据包回调                         |
| onScte35MetadataArrived(scte35_metadata, player)       | SCTE35_METADATA_ARRIVED    | 提供包含（stream_type=0x86）的 SCTE35 元数据包的回调           |
| onPesPrivateDataArrived(private_data, player)          | PES_PRIVATE_DATA_ARRIVED   | 提供包含私有数据的ISO/IEC 13818-1 PES数据包（stream_type=0x06）回调 |
| onStatisticsInfo(statisticsInfo, player)               | STATISTICS_INFO            | 提供播放统计信息，例如丢帧，当前速度等。                             |

### Player对象

通过调用 `init()` 方法产生的 flvjs.player 对象，该插件在原有基础上进行了扩展，增加了以下方法：

**update()**

更新视频时间到最新

**rebuild()**

重建播放器，会调用 `destroy()` 和 `init()`

**close()**

销毁播放器

**已废弃 onerror(event)**

mpegts 的 `ERROR` 事件，请使用 `flv.onError` 替代


**已废弃 onstats(event)**

mpegts 的 `STATISTICS_INFO` 事件，请使用 `flv.onStatisticsInfo` 替代

**已废弃 onmedia(event)**

mpegts 的 `MEDIA_INFO` 事件，请使用 `flv.onMediaInfo` 替代

**其他属性/方法**

mpegts.player 对象上的属性：

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
