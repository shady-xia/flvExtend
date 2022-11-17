<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>flvExtend直播功能测试</title>
    <link rel="stylesheet" type="text/css" href="demo.css" />
    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script src="flvExtend.js"></script>
  </head>
  <body>
    <div id="app">
      <div class="app-main">
        <div class="video-wrap">
          <div class="video-inner">
            <video id="video" autoplay controls muted preload="none"></video>
          </div>
        </div>

        <div class="setting-wrap">
          <div class="title">实时直播功能测试</div>
          <div class="form-item">
            <span>flv.js选项：</span>
            <label><input type="checkbox" v-model="flvSettings.withCredentials" />withCredentials</label>
            <label><input type="checkbox" v-model="flvSettings.hasAudio" />hasAudio</label>
          </div>
          <div class="form-item">
            <span>Extend功能：</span>
            <label><input type="checkbox" v-model="extendSettings.frameTracking" />追帧</label>
            <label><input type="checkbox" v-model="extendSettings.reconnect" />断流重连</label>
            <label><input type="checkbox" v-model="extendSettings.updateOnStart"/>点击播放后实时更新</label>
            <label><input type="checkbox" v-model="extendSettings.updateOnFocus"/>回到前台后实时更新</label>
          </div>
          <div class="form-item">
            <span>流地址：</span>
            <input class="stream-url" v-model="url" placeholder="请输入直播流地址" />
          </div>

          <div class="action-list">
            <button class="btn btn-load" @click="loadFlv">加载视频</button>
          </div>

          <div class="video-stats">
            <p>播放统计信息：</p>
            <div class="video-stats-info">
              <pre>{{stats}}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      var app = new Vue({
        el: '#app',

        data: {
          url: '',
          flvSettings: {
            withCredentials: false,
            hasAudio: false
          },
          extendSettings: {
            frameTracking: true,
            updateOnStart: true,
            updateOnFocus: true,
            reconnect: true
          },
          stats: ''
        },

        mounted() {
          this.getOptions()
          this.loadFlv()
        },

        methods: {
          loadFlv() {
            if (!this.url) return

            this.saveOptions()

            if (this.flv) {
              this.flv.destroy()
            }

            var video = document.getElementById('video')

            this.flv = new FlvExtend({
              element: video,
              frameTracking: this.extendSettings.frameTracking, // 追帧设置
              updateOnStart: this.extendSettings.updateOnStart, // 点击播放按钮后实时更新视频
              updateOnFocus: this.extendSettings.updateOnFocus, // 回到前台后实时更新
              reconnect: this.extendSettings.reconnect, // 断流后重连
              reconnectInterval: 2000, // 重连间隔(ms)
              trackingDelta: 2 // 追帧最大延迟
            })

            this.player = this.flv.init(
              {
                type: 'flv',
                url: this.url,
                isLive: true,
                hasAudio: this.flvSettings.hasAudio,
                withCredentials: this.flvSettings.withCredentials
              },
              {
                enableStashBuffer: false // 是否启用IO隐藏缓冲区。如果您需要实时（最小延迟）来进行实时流播放，则设置为false
              }
            )

            this.player.play()

            this.player.onstats = (e) => {
              this.stats = JSON.stringify(e, null, 2)
            }
          },

          getOptions() {
            var flvSettings = localStorage.getItem('flvExtendDemo_flv')
            var extendSettings = localStorage.getItem('flvExtendDemo_extend')
            var url = localStorage.getItem('flvExtendDemo_url')

            if (flvSettings) {
              this.flvSettings = JSON.parse(flvSettings)
            }
            if (extendSettings) {
              this.extendSettings = JSON.parse(extendSettings)
            }
            if (url) {
              this.url = url
            }
          },

          saveOptions() {
            localStorage.setItem('flvExtendDemo_flv', JSON.stringify(this.flvSettings))
            localStorage.setItem('flvExtendDemo_extend', JSON.stringify(this.extendSettings))
            localStorage.setItem('flvExtendDemo_url', this.url)
          },
        }
      })
    </script>
  </body>
</html>
