import FlvJs from 'mpegts.js/d.ts/mpegts'

declare namespace FlvExtend {
  interface Options {
    /**
     * @desc The video element
     */
    element: HTMLElement;
    /**
     * @desc 追帧设置
     * @defaultvalue false
     */
    frameTracking?: boolean;
    /**
     * @desc 点击播放按钮后实时更新视频
     * @defaultvalue false
     */
    updateOnStart?: boolean;
    /**
     * @desc 获得焦点后实时更新视频
     * @defaultvalue false
     */
    updateOnFocus?: boolean;
    /**
     * @desc 断流后重连
     * @defaultvalue false
     */
    reconnect?: boolean;
    /**
     * @desc 重连间隔(ms)
     * @defaultvalue 0
     */
    reconnectInterval?: number;
    /**
     * @desc 能接受的最大延迟(s)
     * @defaultvalue 2
     */
    trackingDelta?: number;
    /**
     * @desc 追帧时的播放速率
     * @defaultvalue 1.1
     */
    trackingPlaybackRate?: number;
    /**
     * @desc 是否显示插件的log信息（回到前台、跳帧、卡住重建、视频ERROR）
     * @defaultvalue false
     */
    showLog?: boolean;
  }

  interface Player extends FlvJs.Player {
    close(): void;
    update(): void;
    rebuild(): void;
    onerror(event: string): void;
    onstats(event: string): void;
    onmedia(event: string): void;
  }
}

export default class FlvExtend {
  constructor(options: FlvExtend.Options);
  player: FlvExtend.Player;
  options: FlvExtend.Options;
  videoElement: HTMLElement;
  init(mediaDataSource: FlvJs.MediaDataSource, config?: FlvJs.Config): FlvExtend.Player;
  mediaDataSource: FlvJs.MediaDataSource;
  config: FlvJs.Config;
  update(): FlvExtend;
  rebuild(): FlvExtend;
  destroy(): FlvExtend;
}
