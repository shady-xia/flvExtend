# flvExtend.js

基于 flv.js 的功能扩展插件

对 `flv.js` 的一些常见问题，形成解决方案并进行封装

见文章：[flv.js 追帧、断流重连及实时更新的直播优化方案](https://www.cnblogs.com/xiahj/p/flvExtend.html)

## 特性

- 追帧
- 断流重连
- 实时更新视频
- 解决 stuck 问题

## Demo

[https://shady-xia.github.io/flvExtend](https://shady-xia.github.io/flvExtend)

## 安装及使用

```bash
npm install flv-extend -S
```

```html
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
    stashInitialSize: 128 // 减少首帧显示等待时长
  }
)

// 直接调用play即可播放
player.play()
```

## API

### FlvExtend

**constructor**

实例化 FlvExtend

```js
new FlvExtend(Options)
```

Options 选项如下：


| 字段                   | 类型          | 默认值 | 描述                                                                          |
|----------------------|-------------| -------- |-----------------------------------------------------------------------------|
| element              | HTMLElement | 无     | \*必填，video 标签的 dom                                                          |
| frameTracking        | boolean     | false  | 是否开启追帧设置                                                                    |
| updateOnStart        | boolean     | false  | 点击播放按钮后实时更新视频                                                               |
| updateOnFocus        | boolean     | false  | 回到前台后实时更新视频                                                                 |
| reconnect            | boolean     | false  | 断流后重连                                                                       |
| reconnectInterval    | boolean     | 0      | 重连间隔(ms)                                                                    |
| trackingDelta        | number      | 2 | 能接受的最大延迟(s)，当视频缓冲区末尾时间与当前播放时间的差值（即实时延迟）大于该值时，会触发追帧。注意：如果该值设置过小，则会频繁触发视频loading |
| trackingPlaybackRate | number      | 1.1      | 追帧时的播放速率，需大于1                                                               |


**init(mediaDataSource, config)**

初始化播放器，得到 player 对象

参数与 flv.js 中的 `createPlayer(mediaDataSource, config)` 相同，该方法主要做了以下事情：

- 调用 `flvjs.createPlayer()` 创建播放器
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

flvjs 的 `ERROR` 事件

```js
// e.g.
player.onerror = (e) => {
  console.log('error', e)
}
```

**onstats(event)**

flvjs 的 `STATISTICS_INFO` 事件

**onmedia(event)**

flvjs 的 `MEDIA_INFO` 事件

**其他属性/方法**

flvjs.player 对象上的属性：

```typescript
interface Player {
  constructor(mediaDataSource: MediaDataSource, config?: Config): Player
  destroy(): void
  on(event: string, listener: Function): void
  off(event: string, listener: Function): void
  attachMediaElement(mediaElement: HTMLMediaElement): void
  detachMediaElement(): void
  load(): void
  unload(): void
  play(): Promise<void>
  pause(): void
  type: string
  buffered: TimeRanges
  duration: number
  volume: number
  muted: boolean
  currentTime: number
  mediaInfo: Object
  statisticsInfo: Object
}
```

## License

[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
