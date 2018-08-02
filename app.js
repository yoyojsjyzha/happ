const Api = require('./utils/api.js')

App({
  onLaunch: function (options) {
    // 检测更新
    const updateManager = wx.getUpdateManager && wx.getUpdateManager();
    if (updateManager) {
      updateManager.onCheckForUpdate(function (res) {
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })

      })

      updateManager.onUpdateFailed(function () {
        console.log('update failed');
      })
    }
  },
  onShow: function (options) {
  },
  onHide: function () {
  },
  onError: function (msg) {
  },
  globalData: {
    redirectTimes: 0,
  }
})