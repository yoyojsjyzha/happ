export default {
  /**
    * 清空空参数
  */
  rmBalnkParams(obj) {
    if (!obj) return {};
    const ret = {};
    Object.keys(obj).forEach((it) => {
      let v = obj[it];
      if (v == null || v === undefined || v === 'null' || v === 'undefined') {
        v = '';
      }
      ret[it] = v;
    });
    return ret;
  },
  /**
   * 将obj转成 &连接对字符串
   * @param {Object} obj
   */
  toQueryString(obj) {
    if (!obj) return '';
    const str = Object.keys(obj).map(it => `${it}=${encodeURIComponent(obj[it])}`);
    return str.join('&');
  },
  /**
   * 重定向到登录授权
   * @param {Object} obj 默认当前页的path和参数
   *      query
   *      path
   */
  redirectToLogin(obj) {
    let { query, path } = obj || {};
    // 默认返回当前页面
    if (!path) {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      path = page.route;
      query = Object.assign({}, query, page.options);
    }
    const q = this.toQueryString(query);
    if (path[0] !== '/') {
      path = `/${path}`;
    }
    if (path.match(/\/login\/login/)) {
      throw new Error('can not redirect to self');
    }
    const fromPath = path + (q ? (`?${q}`) : '');
    wx.redirectTo({
      url: `/pages/login/login?fromPath=${encodeURIComponent(fromPath)}`,
      success() {
        console.log('success redirect to login, from ', fromPath);
      },
    });
  },
};
