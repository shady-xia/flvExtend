/**
 * 基于flv.js的播放增强插件
 * 特性：追帧、断流重连、实时更新、解决stuck问题
 * author：Xia
 */
import flvjs from 'mpegts.js'

const DEFAULT_OPTIONS = {
  element: '', // video element
  frameTracking: false, // 追帧设置
  updateOnStart: false, // 点击播放按钮后实时更新视频
  updateOnFocus: false, // 获得焦点后实时更新视频
  reconnect: true, // 断流后重连
  reconnectInterval: 1000, // 重连间隔(ms)
  maxReconnectAttempts: null, // 最大重连次数（为null则不限制次数）
  trackingDelta: 2, // 追帧最大延迟
  trackingPlaybackRate: 1.1, // 追帧时的播放速率
  showLog: true // 是否显示插件的log信息（回到前台、跳帧、卡住重建、视频ERROR）
}

class FlvExtend {
  player = null

  /**
   * @param {Object} options
   */
  constructor(options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.videoElement = this.options.element
    this.reconnectAttempts = 0
    this.forcedClose = false

    this._validateOptions()
  }

  /**
   * 初始化播放器
   * @param mediaDataSource
   * @param config
   * @returns FlvJs.Player
   */
  init(mediaDataSource, config = {}) {
    if (this.player) {
      this.destroy()
    }

    this.mediaDataSource = mediaDataSource
    this.config = config

    this.forcedClose = false

    if (this.videoElement) {
      this.player = flvjs.createPlayer(mediaDataSource, config)
      this.player.attachMediaElement(this.videoElement)
      this.player.load()
    }

    this._bindPlayerOptions()
    this._bindPlayerMethods()
    this._bindPlayerEvents()
    this._handleStuck()

    return this.player
  }

  // 更新时间到最新
  update() {
    if (this.player && this.player.buffered.length) {
      this.player.currentTime = this.player.buffered.end(0) - 1
    }
  }

  // 重建播放器
  rebuild() {
    if (this.forcedClose) return
    this.destroy()
    this.init(this.mediaDataSource, this.config)
  }

  destroy() {
    if (this.player) {
      this.player.pause()
      this.player.unload()
      this.player.detachMediaElement()
      this.player.destroy()
      this.player = null
    }
    this.interval && clearInterval(this.interval)
    this.timeout && clearTimeout(this.timeout)
    this.videoElement.removeEventListener('progress', this._onProgress.bind(this))
    this.videoElement.removeEventListener('play', this.update.bind(this))
    window.onfocus = null
  }

  _onProgress(e) {
    // 追帧设置
    if (this.options.frameTracking) {
      this._handleFrameTracking()
    }

    this.reconnectAttempts = 0
    this.onProgress(e, this.player)
  }

  _bindPlayerOptions() {
    this.videoElement.removeEventListener('progress', this._onProgress.bind(this))
    this.videoElement.addEventListener('progress', this._onProgress.bind(this))

    // 点击播放按钮，更新视频
    if (this.options.updateOnStart) {
      this.videoElement.removeEventListener('play', this.update.bind(this))
      this.videoElement.addEventListener('play', this.update.bind(this))
    }

    // 网页重新激活后，更新视频
    if (this.options.updateOnFocus) {
      window.onfocus = () => {
        this.log('回到前台')
        this.update()
      }
    }
  }

  _bindPlayerMethods() {
    // this.player.close = this.destroy.bind(this)
    this.player.close = () => {
      this.forcedClose = true
      this.destroy()
    }
    this.player.update = this.update.bind(this)
    this.player.rebuild = this.rebuild.bind(this)

    // 从 v0.3.0 开始废弃
    this.player.onerror = (e) => {}
    this.player.onstats = (e) => {}
    this.player.onmedia = (e) => {}
  }

  _bindPlayerEvents() {
    const events = flvjs.Events
    for (let i in events) {
      const eventCamelCase = this.toCamelCase(events[i])
      this[`on${eventCamelCase}`] = (e, player) => {}

      // 批量绑定mpegts事件回调
      if (events[i] !== 'error') {
        this.player.on(events[i], (e) => {
          this[`on${eventCamelCase}`](e, this.player)
        })
      }
    }

    this.player.on(flvjs.Events.ERROR, (...e) => {
      const err = [...e]
      const errorObj = {
        type: err[0],
        detail: err[1],
        info: err[2]
      }
      this.onError(errorObj, this.player)
      this.player.onerror(errorObj)
      this._tryReconnect(errorObj)
      this.log('视频ERROR', errorObj)
    })

    this.player.on(flvjs.Events.STATISTICS_INFO, (statisticsInfo) => {
      this.player.onstats(statisticsInfo)
    })

    this.player.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
      this.reconnectAttempts = 0
      this.player.onmedia(mediaInfo)
    })
  }

  _tryReconnect(e) {
    const { reconnect, reconnectInterval, maxReconnectAttempts } = this.options
    if (!reconnect) return

    if (!maxReconnectAttempts || (maxReconnectAttempts && this.reconnectAttempts < maxReconnectAttempts)) {
      this.timeout = setTimeout(() => {
        this.reconnectAttempts++
        this.onReconnect({...e, reconnectAttempts: this.reconnectAttempts}, this.player)
        this.rebuild()
      }, reconnectInterval)

      // 重连次数已耗尽，重连失败
    } else {
      this.onReconnectFailed(e, this.player)
    }
  }

  // 追帧
  _handleFrameTracking() {
    if (!this.player || !this.player?.buffered.length) return

    try {
      let end = this.player.buffered.end(0) // 获取当前buffered值(缓冲区末尾)
      let delta = end - this.player.currentTime // 获取buffered与当前播放位置的差值

      // 延迟过大，通过跳帧的方式更新视频
      if (delta > 10 || delta < 0) {
        this.log('跳帧')
        this.update()
        return
      }

      // 延迟较小时，通过调整播放速度的方式来追帧
      if (delta > this.options.trackingDelta) {
        this.videoElement.playbackRate = this.options.trackingPlaybackRate
      } else {
        this.videoElement.playbackRate = 1
      }
    } catch (e) {
      console.log(e)
    }
  }

  // 解决stuck的问题
  _handleStuck() {
    let lastDecodedFrames = 0
    let stuckTime = 0

    this.interval && clearInterval(this.interval)

    // 目前连续3s帧无变化则为视频卡住，后续可根据需求进行扩展
    this.interval = setInterval(() => {
      const decodedFrames = this.player.statisticsInfo.decodedFrames
      if (!decodedFrames) return

      if (lastDecodedFrames === decodedFrames && !this.videoElement.paused) {
        stuckTime++
        if (stuckTime > 2) {
          this.onStuck(this.player)
          // this.log('STUCK')
          // this.rebuild()
        }
      } else {
        lastDecodedFrames = decodedFrames
        stuckTime = 0
      }
    }, 1000)
  }

  _validateOptions() {
    if (!this.videoElement) {
      throw new Error('options中缺少element参数！')
    }

    if (this.options.trackingPlaybackRate < 1) {
      throw new Error('trackingPlaybackRate参数不能小于1！')
    }

    // 兼容旧参数
    if (this.options.frameTrackingDelta) {
      this.options.trackingDelta = this.options.frameTrackingDelta
    }

    if (this.options.reconnectInterval <= 0) {
      this.options.reconnectInterval = 1000
    }
  }

  log(message, ...rest) {
    if (this.options.showLog) {
      console.log(`%c ${message}`, 'background:red;color:#fff', ...rest)
    }
  }

  toCamelCase(str) {
    const arr = str.split(/[_-]/);
    const capitalizedArr = arr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedArr.join('');
  }

  onReconnect(e, player) {}
  onReconnectFailed(e, player) {}
  onProgress(e, player) {}
  onStuck(player) {}
}

export default FlvExtend
