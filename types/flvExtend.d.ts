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
     * @defaultvalue true
     */
    reconnect?: boolean;
    /**
     * @desc 重连间隔(ms)
     * @defaultvalue 1000
     */
    reconnectInterval?: number;
    /**
     * @desc 重连尝试次数
     * @defaultvalue null
     */
    maxReconnectAttempts?: null | number;
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

  interface errorObj {
    type: string;
    detail: string;
    info: object
  }

  interface reconnectObj extends errorObj {
    reconnectAttempts: number
  }
}

export default class FlvExtend {
  constructor(options: FlvExtend.Options);
  player: FlvExtend.Player;
  options: FlvExtend.Options;
  videoElement: HTMLElement;
  reconnectAttempts: number;
  init(mediaDataSource: FlvJs.MediaDataSource, config?: FlvJs.Config): FlvExtend.Player;
  mediaDataSource: FlvJs.MediaDataSource;
  config: FlvJs.Config;
  update(): void;
  rebuild(): void;
  destroy(): void;
  onReconnect(reconnect: FlvExtend.reconnectObj, player: FlvExtend.Player): void;
  onReconnectFailed(err: FlvExtend.errorObj, player: FlvExtend.Player): void;
  onProgress(event, player: FlvExtend.Player): void;
  onStuck(player: FlvExtend.Player): void;
  onError(err: FlvExtend.errorObj, player: FlvExtend.Player): void;
  onLoadingComplete(player: FlvExtend.Player): void;
  onRecoveredEarlyEof(player: FlvExtend.Player): void;
  onMediaInfo(mediaInfo, player: FlvExtend.Player): void;
  onMetadataArrived(metadata, player: FlvExtend.Player): void;
  onScriptdataArrived(data, player: FlvExtend.Player): void;
  onTimedId3MetadataArrived(timed_id3_metadata, player: FlvExtend.Player): void;
  onSmpte2038MetadataArrived(smpte2038_metadata, player: FlvExtend.Player): void;
  onScte35MetadataArrived(scte35_metadata, player: FlvExtend.Player): void;
  onPesPrivateDataArrived(private_data, player: FlvExtend.Player): void;
  onStatisticsInfo(statisticsInfo, player: FlvExtend.Player): void;
}
