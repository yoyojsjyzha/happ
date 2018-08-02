import * as api from '../../utils/api';
import store from '../../utils/store';

Page({
  data: {
    showButton: false,
    fromPath: ''
  },
  onLoad(options) {
    this.setData({ 'fromPath': decodeURIComponent(options.fromPath) });
    wx.showLoading({ title: '加载中' });
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              this.bindGetUserInfo({ detail: res })
            }
          })
        } else {
          wx.hideLoading()
          this.setData({ showButton: true })
        }
      }
    });
  },
  bindGetUserInfo(e) {
    // 死循环
    if (getApp().globalData.redirectTimes > 4) {
      this.setData({ showButton: true })
      wx.hideLoading()
      return console.error('服务器异常，infinite loop')
    }
    if (e.detail && e.detail.errMsg && e.detail.errMsg.match(/deny/)) {
      return console.error('deny auth userinfo')
    }
    api.decryptUserInfo(e.detail)
      .then((res) => {
        if (res.data && res.data.data && res.data.data.token) {
          store.setToken(res.data.data.token);
        }
        if (res.data.code == 100) {
          let d = res.data.data;
          let { status, identity } = d;
          // 小b
          store.setCurrentUserInfo(Object.assign(d.userInfo, { status, identity }));
          return wx.redirectTo({
            url: this.data.fromPath
          })
        } else {
          // 抛出错误
          // 400 需要解密userinfo
          // 500 服务器报错
          throw new Error(res.data.code);
        }
      }).catch(e => {
        wx.hideLoading();
        console.error(e);
      })
  },
  onReady() {
    console.log('onReady2');
  },
  onShow(options) {
    console.log('onshow2', options);
  },
  onHide() {

  },
  onUnload() {

  }
})
