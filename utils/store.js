const storeKey = 'akc_';
const userInfoKey = 'curr_user';
export default {
  getToken() {
    return this.getStorage('token');
  },
  setToken(token) {
    this.setStorage('token', token);
  },
  setStorage(key, value) {
    wx.setStorageSync(storeKey + key, value);
  },
  getStorage(key) {
    return wx.getStorageSync(storeKey + key);
  },
  /**
     * 获取当前用户（使用者）信息
     */
  getCurrentUserInfo() {
    return this.getStorage(userInfoKey);
  },
  /**
     *
     * @param {Object} value 存储当前用户信息
     */
  setCurrentUserInfo(value) {
    this.setStorage(userInfoKey, value);
  },
};
