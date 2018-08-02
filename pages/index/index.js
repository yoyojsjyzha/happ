// pages/index/index.js
import * as api from '../../utils/api.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  onLoad(options) {
    api.getCurrentUserInfo(options.unionid).then((user) => {
      console.log(user)
    });
  },
  onReady() {
  },
});