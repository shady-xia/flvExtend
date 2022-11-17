/**
 * 基于flv.js的播放增强插件
 * 特性：追帧、断流重连、实时更新、解决stuck问题
 * author：Xia
 */
import flvjs from 'flv.js'

const DEFAULT_OPTIONS = {
  element: '', // video element
  frameTracking: false, // 追帧设置
  updateOnStart: false, // 点击播放按钮后实时更新视频
  updateOnFocus: false, // 获得焦点后实时更新视频
  reconnect: false, // 断流后重连
  reconnectInterval: 0, // 重连间隔(ms)
  trackingDelta: 2, // 追帧最大延迟
  trackingPlaybackRate: 1.1 // 追帧时的播放速率
}

class FlvExtend {
  player = null

  /**
   * @param {Object} options
   */
  constructor(options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.videoElement = this.options.element

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
    window.onfocus = null
  }

  _bindPlayerOptions() {
    // 追帧设置
    if (this.options.frameTracking) {
      this.videoElement.removeEventListener('progress', this._handleFrameTracking.bind(this))
      this.videoElement.addEventListener('progress', this._handleFrameTracking.bind(this))
    }

    // 点击播放按钮，更新视频
    if (this.options.updateOnStart) {
      this.videoElement.addEventListener('play', () => {
        this.update()
      })
    }

    // 网页重新激活后，更新视频
    if (this.options.updateOnFocus) {
      window.onfocus = () => {
        console.log(`%c 回到前台 `, 'background:red;color:#fff')
        this.update()
      }
    }
  }

  _bindPlayerMethods() {
    this.player.close = this.destroy.bind(this)
    this.player.update = this.update.bind(this)
    this.player.rebuild = this.rebuild.bind(this)
  }

  _bindPlayerEvents() {
    this.player.onerror = (e) => {}
    this.player.onstats = (e) => {}
    this.player.onmedia = (e) => {}

    this.player.on(flvjs.Events.ERROR, (e) => {
      this.player.onerror(e)

      const { reconnect, reconnectInterval } = this.options
      if (reconnect && reconnectInterval >= 0) {
        this.timeout = setTimeout(() => {
          this.rebuild()
        }, reconnectInterval)
      }
      console.log(`%c 视频ERROR： `, 'background:red;color:#fff', e)
    })
    this.player.on(flvjs.Events.STATISTICS_INFO, (e) => this.player.onstats(e))
    this.player.on(flvjs.Events.MEDIA_INFO, (e) => this.player.onmedia(e))
  }

  // 追帧
  _handleFrameTracking() {
    if (!this.player || !this.player?.buffered.length) return

    try {
      let end = this.player.buffered.end(0) // 获取当前buffered值(缓冲区末尾)
      let delta = end - this.player.currentTime // 获取buffered与当前播放位置的差值

      // 延迟过大，通过跳帧的方式更新视频
      if (delta > 10 || delta < 0) {
        console.log(
          `%c 准备跳帧. `,
          'background:red;color:#fff',
          this.player._transmuxer?._controller
        )
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
    this.interval = setInterval(() => {
      const decodedFrames = this.player.statisticsInfo.decodedFrames
      if (!decodedFrames) return

      if (lastDecodedFrames === decodedFrames && !this.videoElement.paused) {
        // 可能卡住了，重载
        stuckTime++
        if (stuckTime > 1) {
          console.log(`%c 卡住，重建视频`, 'background:red;color:#fff')
          this.rebuild()
        }
      } else {
        lastDecodedFrames = decodedFrames
        stuckTime = 0
      }
    }, 800)
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
  }
}

export default FlvExtend
